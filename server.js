const app = require('./app');
const config = require('./config/config');
const logger = require('./utils/logger');

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
