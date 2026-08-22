import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

/**
 * Global API Rate Limiter: 1000 requests per 15 minutes window
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true, // Return standard RateLimit headers
  legacyHeaders: false, // Disable X-RateLimit headers
  skip: () => config.isTest, // Disable in test environment to avoid test interference
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});

/**
 * Strict Authentication Rate Limiter: 15 attempts per 15 minutes
 * Protects login and registration routes against brute force & credential stuffing
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 authentication attempts
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest, // Disable in test environment
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});
