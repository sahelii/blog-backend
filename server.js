const express = require('express');
const compression = require('compression');
const connectDB = require('./config/db');
const config = require('./config/config');
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

// Initialize Express app
const app = express();

// Connect Database
connectDB();

// Security Middleware (apply before other middleware)
app.use(helmet);
app.use(compression());
app.use(mongoSanitize());
app.use(xss());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HPP should be after body parsers to protect against parameter pollution
// Initialize hpp middleware here after Express app is set up
try {
  app.use(hpp());
} catch (error) {
  logger.warn('HPP middleware failed to initialize, continuing without it:', error.message);
}

// CORS configuration
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Health check endpoint
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

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT} in ${config.nodeEnv} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});
