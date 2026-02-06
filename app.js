const express = require('express');
const compression = require('compression');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Initialize Redis (connects in background, app works without it)
require('./config/redis');

// Import security middleware
const { 
  helmet, 
  limiter, 
  authLimiter, 
  mongoSanitize, 
  xss, 
  hpp 
} = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Swagger documentation
const { swaggerSpec, swaggerUi } = require('./swagger/swagger');

// Initialize Express app
const app = express();

// Connect Database (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Request logging middleware (should be early in the chain)
const requestLogger = require('./middleware/requestLogger');
app.use(requestLogger);

// Security Middleware (apply before other middleware)
app.use(helmet);
app.use(compression());
app.use(mongoSanitize());
app.use(xss());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HPP should be after body parsers to protect against parameter pollution
try {
  app.use(hpp());
} catch (error) {
  logger.warn('HPP middleware failed to initialize, continuing without it:', error.message);
}

// CORS: config-driven allowlist (see config/config.js and middleware/cors.js)
const corsMiddleware = require('./middleware/cors');
app.use(corsMiddleware);

// Rate limiting (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/', limiter);
  app.use('/api/auth/', authLimiter);
}

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'StoryHub API Documentation',
}));

// Health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns server status and timestamp
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Server is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
