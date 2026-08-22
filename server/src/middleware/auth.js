import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { config } from '../config/env.js';

/**
 * Authentication Middleware: Identifies and verifies the current user via JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      // 2. Fallback to cookie if present
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(ApiError.unauthorized('Access denied. No authentication token provided.'));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(ApiError.unauthorized('Token has expired. Please refresh your session.'));
      }
      return next(ApiError.unauthorized('Invalid authentication token.'));
    }

    // Retrieve active user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(ApiError.unauthorized('User belonging to this token no longer exists.'));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based Authorization Middleware
 * @param  {...string} allowedRoles - e.g. 'student', 'faculty', 'admin'
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};
