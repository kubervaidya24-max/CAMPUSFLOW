import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;
let memoryServerInstance = null;

export const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });

    isConnected = conn.connection.readyState === 1;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    // In development mode, if local MongoDB is not running, provide an automatic in-memory fallback
    if (!config.isProduction && !config.isTest && error.message.includes('ECONNREFUSED')) {
      console.warn('[Database Notice] Local MongoDB (127.0.0.1:27017) not detected. Launching in-memory MongoDB fallback for instant local dev...');
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
