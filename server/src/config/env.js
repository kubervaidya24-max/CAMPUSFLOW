import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusflow',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
