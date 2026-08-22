import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { sanitize } from './middleware/sanitize.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();

// HTTP Response Compression (Gzip / Deflate for network speed optimization)
app.use(
  compression({
    level: 6,
    threshold: 1024, // only compress responses above 1kb
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin === '*' ? '*' : [config.corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Cookie parser middleware
app.use(cookieParser(config.cookieSecret));

// Request logging (skip in test environment)
if (!config.isTest) {
  app.use(morgan(config.isProduction ? 'combined' : 'dev'));
}

// Body parsing with strict size limits (prevent payload DoS)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// NoSQL query injection sanitization
app.use(sanitize);

// Global API rate limiting
app.use('/api', apiLimiter);

// Mount API routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to CampusFlow API Server',
    documentation: '/api/health',
  });
});

// 404 Catch-all handler
app.use(notFoundHandler);

// Centralized Error handler
app.use(errorHandler);

export default app;
