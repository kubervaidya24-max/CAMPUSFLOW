import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusflow',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // JWT & Cookie Configuration
  jwtSecret: process.env.JWT_SECRET || 'campusflow_dev_jwt_access_secret_key_2026_super_secure',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'campusflow_dev_jwt_refresh_secret_key_2026_super_secure',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'campusflow_dev_cookie_secret_key_2026',
};
