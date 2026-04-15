/**
 * ============================================
 * SalonFlow — Express Server
 * ============================================
 * Main application entry point. Configures
 * Express middleware, API routes, Socket.IO,
 * and database connection.
 *
 * Production-ready with:
 * - HTTPS enforcement (Gap #2)
 * - JWT secret validation (Gap #3)
 * - Winston logging (Gap #4)
 * - Razorpay webhooks (Gap #9)
 * - Socket.IO authentication (Gap #10)
 * - Swagger API docs (Gap #15)
 * - Email queue (Gap #13)
 * - Image upload serving (Gap #7)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');

// Load environment config (validates required vars)
const config = require('./config/env');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./config/logger');
const { validateSecretStrength } = require('./config/secrets');
const swaggerSpec = require('./config/swagger');

// ─── Validate JWT Secret Strength (Gap #3) ────────────────────
const secretCheck = validateSecretStrength(config.jwtSecret);
if (!secretCheck.valid) {
  logger.warn(`⚠️  JWT Security Warning: ${secretCheck.reason}`);
  if (config.nodeEnv === 'production') {
    logger.error('Cannot start production server with insecure JWT_SECRET');
    process.exit(1);
  }
}

// ─── Initialize Express ───────────────────────────────────────
const app = express();
const httpServer = createServer(app);

// ─── Socket.IO Setup with Authentication (Gap #10) ────────────
const io = new Server(httpServer, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
  },
});

// Socket.IO JWT Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    // Allow connection but mark as unauthenticated
    socket.userId = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    // Try previous secret for rotation support (Gap #3)
    const prevSecret = process.env.JWT_PREVIOUS_SECRET;
    if (prevSecret) {
      try {
        const decoded = jwt.verify(token, prevSecret);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        return next();
      } catch (e) {
        // Both secrets failed
      }
    }
    next(new Error('Authentication failed'));
  }
});

// Make io accessible to routes
app.set('io', io);

// ─── HTTPS Enforcement (Gap #2) ──────────────────────────────
if (config.nodeEnv === 'production') {
  app.use((req, res, next) => {
    // Trust proxy headers (Render, Railway, Heroku, etc.)
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}
app.set('trust proxy', 1);

// ─── Security Middleware ──────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com", "https://api.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://lux-cdn.razorpay.com", config.clientUrl, "ws:", "wss:"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  // Gap #2: HSTS header for HTTPS enforcement
  hsts: config.nodeEnv === 'production' ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  } : false,
}));

app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// ─── Webhook Raw Body (Gap #9) ────────────────────────────────
// Must be before express.json() to capture raw body for signature verification
app.use('/api/webhooks', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body.toString('utf8');
  req.body = JSON.parse(req.rawBody);
  next();
});

// ─── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ─── Serve Uploaded Files (Gap #7) ────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── MongoDB Injection Prevention ─────────────────────────────
app.use((req, res, next) => {
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'object') {
        req.query[key] = String(req.query[key]);
      }
    }
  }
  next();
});

// ─── HTTP Logging (Gap #4: Winston) ───────────────────────────
if (config.nodeEnv !== 'test') {
  app.use(morgan(
    config.nodeEnv === 'development' ? 'dev' : 'combined',
    { stream: logger.stream }
  ));
}

// ─── API Documentation (Gap #15: Swagger) ─────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SalonFlow API Docs',
}));

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/services', require('./routes/service.routes'));
app.use('/api/staff', require('./routes/staff.routes'));
app.use('/api/appointments', require('./routes/appointment.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/inventory', require('./routes/inventory.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/webhooks', require('./routes/webhook.routes'));

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SalonFlow Server is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ─── Error Handler ────────────────────────────────────────────
app.use(errorHandler);

// ─── Socket.IO Connection Handler (Gap #10) ───────────────────
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`, { userId: socket.userId });

  // Auto-join authenticated user to their notification room
  if (socket.userId) {
    socket.join(`user_${socket.userId}`);
    logger.debug(`User ${socket.userId} joined notification room`);
  }

  // Legacy join handler (for backwards compatibility)
  socket.on('join', (userId) => {
    if (socket.userId && socket.userId === userId) {
      socket.join(`user_${userId}`);
    }
  });

  socket.on('disconnect', () => {
    logger.debug(`Socket disconnected: ${socket.id}`);
  });
});

// ─── Start Server ─────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize email queue (Gap #13)
    if (config.nodeEnv !== 'test') {
      try {
        const { initEmailQueue } = require('./jobs/emailQueue');
        await initEmailQueue();
      } catch (err) {
        logger.warn('Email queue initialization failed (non-critical):', err.message);
      }
    }

    // Start HTTP server
    httpServer.listen(config.port, () => {
      logger.info('═══════════════════════════════════════');
      logger.info('  SalonFlow Server Started');
      logger.info('═══════════════════════════════════════');
      logger.info(`  Port: ${config.port}`);
      logger.info(`  Env:  ${config.nodeEnv}`);
      logger.info(`  URL:  http://localhost:${config.port}`);
      logger.info(`  Docs: http://localhost:${config.port}/api-docs`);
      logger.info('═══════════════════════════════════════');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ─── Graceful Shutdown ────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  // Stop email queue
  try {
    const { stopEmailQueue } = require('./jobs/emailQueue');
    await stopEmailQueue();
  } catch (err) {
    // Ignore
  }

  httpServer.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });

  // Force exit after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Only start if not in test mode (supertest handles it)
if (config.nodeEnv !== 'test') {
  startServer();
}

module.exports = app;
