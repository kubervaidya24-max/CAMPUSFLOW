import mongoose from 'mongoose';
import { config } from '../config/env.js';

/**
 * Health check controller
 * @route GET /api/health
 */
export const getHealth = (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbState = dbStatusMap[mongoose.connection.readyState] || 'unknown';

  const healthData = {
    service: 'CampusFlow API',
    status: 'operational',
    version: '0.1.0',
    environment: config.nodeEnv,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbState,
      name: mongoose.connection.name || 'campusflow',
    },
  };

  return res.status(200).json({
    success: true,
    message: 'CampusFlow API is running',
    data: healthData,
  });
};
