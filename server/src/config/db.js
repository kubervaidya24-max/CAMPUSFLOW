import dns from 'dns';
import mongoose from 'mongoose';
import { config } from './env.js';

// Configure reliable DNS servers (Google + Cloudflare) for MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Fall back to system DNS if custom servers fail
}

let isConnected = false;
let memoryServerInstance = null;

export const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connection.readyState === 1;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    // In development mode, if local MongoDB or Atlas is not reachable, provide an automatic in-memory fallback
    if (!config.isProduction && !config.isTest) {
      console.warn(`[Database Notice] MongoDB connection failed (${error.message}). Launching in-memory MongoDB fallback for instant local dev...`);
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memUri = memoryServerInstance.getUri();
        const memConn = await mongoose.connect(memUri);
        isConnected = memConn.connection.readyState === 1;
        console.log(`[Database] In-Memory MongoDB Connected: ${memUri}`);
        return memConn.connection;
      } catch (memErr) {
        console.error(`[Database Error] In-memory MongoDB fallback failed: ${memErr.message}`);
      }
    }

    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (config.isProduction) {
      process.exit(1);
    }
    return null;
  }
};

export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[Database] MongoDB Disconnected');
  }
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
    memoryServerInstance = null;
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[Database Warning] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database Error] Event error:', err.message || err);
});
