import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

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
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // In test environment, don't necessarily exit process, just throw
    if (config.isProduction) {
      process.exit(1);
    }
    return null;
  }
};

export const disconnectDB = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log('[Database] MongoDB Disconnected');
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[Database Warning] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database Error] Event error:', err);
});
