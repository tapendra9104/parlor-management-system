/**
 * ============================================
 * SalonFlow — Gemini Service
 * ============================================
 * Integrates Google Gemini API for the salon
 * AI chatbot with function-calling capabilities.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = `You are SalonFlow, a friendly and professional virtual assistant for a premium salon. Your personality is warm, helpful, and knowledgeable about beauty and grooming.

Your capabilities:
1. **Book Appointments**: Help customers book appointments by collecting service type, preferred date/time, and stylist preference.
2. **Suggest Services**: Recommend services based on customer needs and preferences.
3. **Answer FAQs**: Respond to questions about pricing, hours (Monday-Saturday 9 AM - 8 PM, Sunday 10 AM - 6 PM), policies, and services.
4. **Hair/Beauty Advice**: Offer general beauty tips and recommendations.
5. **Handle Modifications**: Help with rescheduling or cancellations.

Service Categories Available:
- Haircut (₹300-₹1500)
- Hair Color (₹1500-₹5000)
- Hair Treatment (₹800-₹3000)
- Facial (₹500-₹2500)
- Skin Care (₹400-₹2000)
- Manicure (₹300-₹800)
- Pedicure (₹400-₹1000)
- Makeup (₹1500-₹5000)
- Waxing (₹200-₹1500)
- Massage (₹800-₹3000)
- Bridal Package (₹10000-₹50000)

When a customer wants to book, extract the following information and respond with a JSON action block:
- Service needed
- Preferred date
- Preferred time
- Any stylist preference

Format your booking action as:
\`\`\`action
{"type": "book_appointment", "data": {"service": "...", "date": "...", "time": "...", "staff": "any"}}
\`\`\`

For slot checking:
\`\`\`action
{"type": "check_slots", "data": {"date": "...", "staff": "any"}}
\`\`\`

Always be conversational, use emojis sparingly, and keep responses concise (2-3 sentences max unless explaining something complex). Never make up availability - always suggest checking real-time slots.`;

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialize();
  }

  initialize() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  Gemini API key not configured. Chatbot will use fallback responses.');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        systemInstruction: SYSTEM_PROMPT,
      });
      console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      console.error('❌ Gemini initialization failed:', error.message);
    }
  }

  async chat(messages, userMessage) {
    if (!this.model) {
      return this.getFallbackResponse(userMessage);
    }

    try {
      // Build conversation history
      const history = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const chat = this.model.startChat({ history });
      const result = await chat.sendMessage(userMessage);
      const response = result.response.text();

      // Parse for action blocks
      const action = this.parseAction(response);

      return {
        content: response.replace(/```action[\s\S]*?```/g, '').trim(),
        action: action,
      };
    } catch (error) {
      console.error('Gemini API error:', error.message);
      
      if (error.message.includes('429') || error.message.includes('quota')) {
        return {
          content: "I'm experiencing high demand right now. Let me help you with a quick response! You can book an appointment through our booking page, or tell me what service you're interested in. 💇‍♀️",
          action: null,
        };
      }

      return this.getFallbackResponse(userMessage);
    }
  }

  parseAction(response) {
    const actionMatch = response.match(/```action\s*([\s\S]*?)\s*```/);
    if (actionMatch) {
      try {
        return JSON.parse(actionMatch[1]);
      } catch {
        return null;
      }
    }
    return null;
  }

  getFallbackResponse(message) {
    const lower = message.toLowerCase();

    if (lower.includes('book') || lower.includes('appointment')) {
      return {
        content: "I'd love to help you book an appointment! 📅 Please visit our booking page where you can select your preferred service, stylist, and time slot. You can also tell me what service you're looking for!",
        action: null,
      };
    }
    if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
      return {
        content: "Our services range from ₹200 for basic grooming to ₹50,000 for bridal packages. Check our Services page for detailed pricing, or ask me about a specific service! 💰",
        action: null,
      };
    }
    if (lower.includes('hour') || lower.includes('open') || lower.includes('timing')) {
      return {
        content: "We're open Monday-Saturday 9 AM to 8 PM, and Sunday 10 AM to 6 PM. 🕐",
        action: null,
      };
    }
    if (lower.includes('cancel')) {
      return {
        content: "To cancel an appointment, go to My Bookings and click cancel. Cancellations are free if made 24 hours before the appointment. Need help with anything else? 😊",
        action: null,
      };
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return {
        content: "Hello! Welcome to SalonFlow! 💇‍♀️ I can help you book appointments, suggest services, or answer any questions. What would you like to do today?",
        action: null,
      };
    }

    return {
      content: "Thanks for reaching out! I'm here to help with bookings, service info, and beauty advice. What can I assist you with today? 😊",
      action: null,
    };
  }
}

module.exports = new GeminiService();
