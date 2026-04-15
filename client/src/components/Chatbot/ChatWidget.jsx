import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiMessageCircle, FiX, FiSend, FiMinus } from 'react-icons/fi';
import './ChatWidget.css';

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello${user ? ` ${user.name.split(' ')[0]}` : ''}! 👋 I'm your SalonFlow AI assistant. I can help you:\n\n📅 Book appointments\n💇‍♀️ Suggest services\n💰 Check pricing\n❓ Answer questions\n\nHow can I help you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (directMessage) => {
    const messageText = directMessage || input.trim();
    if (!messageText || loading) return;

    if (!directMessage) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setLoading(true);

    try {
      if (user) {
        const res = await api.sendChatMessage({ message: messageText, sessionId });
        setSessionId(res.data.sessionId);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: res.data.response,
          action: res.data.action,
        }]);
      } else {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: getOfflineResponse(messageText),
          }]);
          setLoading(false);
        }, 800);
        return;
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again or visit our services page for more information! 😊",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getOfflineResponse = (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('book') || lower.includes('appointment')) {
      return 'To book an appointment, please log in first! Click the "Login" button in the top navigation. You can also create a new account in seconds. 📅';
    }
    if (lower.includes('price') || lower.includes('cost')) {
      return 'Our services range from ₹200 to ₹50,000. Check our Services page for full pricing! Some popular ones:\n\n✂️ Haircut: ₹300-₹1500\n🎨 Hair Color: ₹1500-₹5000\n🧖‍♀️ Facial: ₹500-₹2500\n💆 Massage: ₹800-₹3000';
    }
    if (lower.includes('time') || lower.includes('hour') || lower.includes('open')) {
      return "We're open:\n📅 Mon-Sat: 9:00 AM - 8:00 PM\n📅 Sunday: 10:00 AM - 6:00 PM\n\nBook online anytime! 🕐";
    }
    if (lower.includes('location') || lower.includes('address') || lower.includes('where')) {
      return "📍 We're located at:\n123 Beauty Lane, Andheri West\nMumbai - 400058\n\nNear Metro Station. Free parking available! 🚗";
    }
    return 'Thanks for reaching out! Please log in to get full assistance with bookings and personalized recommendations. Our team is here to help! 💇‍♀️';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { emoji: '📅', label: 'Book Appointment' },
    { emoji: '💰', label: 'Check Prices' },
    { emoji: '🕐', label: 'Working Hours' },
    { emoji: '✂️', label: 'Popular Services' },
  ];

  if (!isOpen) {
    return (
      <button className="chat-fab" onClick={() => setIsOpen(true)} id="chat-fab-btn">
        <FiMessageCircle size={24} />
        <span className="chat-fab-pulse"></span>
      </button>
    );
  }

  return (
    <div className={`chat-widget ${isMinimized ? 'minimized' : ''}`} id="chat-widget">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar">🤖</div>
          <div>
            <h4>SalonFlow AI</h4>
            <span className="chat-status">
              <span className="status-dot"></span> Online
            </span>
          </div>
        </div>
        <div className="chat-header-actions">
          <button onClick={() => setIsMinimized(!isMinimized)} className="chat-control-btn">
            <FiMinus size={16} />
          </button>
          <button onClick={() => setIsOpen(false)} className="chat-control-btn">
            <FiX size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                {msg.role === 'assistant' && <div className="chat-msg-avatar">🤖</div>}
                <div className="chat-bubble">
                  {msg.content.split('\n').map((line, j) => (
                    <span key={j}>{line}<br /></span>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <div className="chat-msg-avatar">🤖</div>
                <div className="chat-bubble typing">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="chat-quick-actions">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  className="quick-action-btn"
                  onClick={() => sendMessage(action.label)}
                >
                  {action.emoji} {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chat-input-area">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              id="chat-input"
            />
            <button
              className="chat-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              id="chat-send-btn"
            >
              <FiSend size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;
