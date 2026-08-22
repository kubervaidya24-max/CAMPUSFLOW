import http from 'http';
import app from './app.js';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initSocketServer } from './socket/socketServer.js';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  const httpServer = http.createServer(app);

  // Initialize Socket.IO Server
  initSocketServer(httpServer);

  httpServer.listen(config.port, () => {
    console.log(`[CampusFlow Server] Running in ${config.nodeEnv} mode on http://localhost:${config.port}`);
    console.log(`[CampusFlow Server] Socket.IO server mounted and active`);
    console.log(`[CampusFlow Server] Health check available at http://localhost:${config.port}/api/health`);
  });

  const handleShutdown = async (signal) => {
    console.log(`\n[CampusFlow Server] Received ${signal}. Shutting down gracefully...`);
    httpServer.close(async () => {
      console.log('[CampusFlow Server] HTTP and Socket.IO server closed.');
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
