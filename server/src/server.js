import app from './app.js';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`[CampusFlow Server] Running in ${config.nodeEnv} mode on http://localhost:${config.port}`);
    console.log(`[CampusFlow Server] Health check available at http://localhost:${config.port}/api/health`);
  });

  const handleShutdown = async (signal) => {
    console.log(`\n[CampusFlow Server] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('[CampusFlow Server] HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });

    // Force exit if shutdown takes too long
    setTimeout(() => {
      console.error('[CampusFlow Server] Forcefully terminating after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[Unhandled Rejection] at:', promise, 'reason:', reason);
  });
};

startServer();
