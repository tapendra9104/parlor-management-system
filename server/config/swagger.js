/**
 * ============================================
 * SalonFlow — Swagger/OpenAPI Configuration
 * ============================================
 * Auto-generates API documentation from JSDoc.
 *
 * Gap #15: API Documentation
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SalonFlow API',
      version: '1.0.0',
      description: 'Premium Salon Management System — RESTful API Documentation',
      contact: {
        name: 'SalonFlow Team',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            pages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['admin', 'staff', 'customer'] },
            phone: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        Service: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Classic Haircut' },
            category: { type: 'string', example: 'Haircut' },
            description: { type: 'string' },
            duration: { type: 'integer', example: 45 },
            price: { type: 'number', example: 500 },
            isActive: { type: 'boolean' },
            image: { type: 'string' },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            customer: { type: 'string' },
            staff: { type: 'string' },
            services: { type: 'array', items: { type: 'string' } },
            date: { type: 'string', format: 'date' },
            timeSlot: {
              type: 'object',
              properties: {
                start: { type: 'string', example: '10:00' },
                end: { type: 'string', example: '11:30' },
              },
            },
            status: { type: 'string', enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'] },
            totalAmount: { type: 'number' },
            totalDuration: { type: 'integer' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            appointment: { type: 'string' },
            customer: { type: 'string' },
            amount: { type: 'number' },
            method: { type: 'string', enum: ['razorpay', 'cash', 'upi'] },
            status: { type: 'string', enum: ['pending', 'completed', 'failed', 'refunded'] },
            razorpayOrderId: { type: 'string' },
            invoiceNumber: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
