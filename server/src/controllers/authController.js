import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { config } from '../config/env.js';
import { setRefreshTokenCookie, clearAuthCookies } from '../utils/token.js';

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, graduationYear, collegeId } = req.body;

    // 1. Check for existing user with identical email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(ApiError.conflict('An account with this email address already exists.'));
    }

    // 2. Instantiate User model
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      profile: {
        department: department || '',
        graduationYear: graduationYear || undefined,
        collegeId: collegeId || '',
      },
    });

    // 3. Issue Token Pair
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // 4. Track refresh token for rotation and revocation
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.refreshTokens = [{ token: refreshToken, expiresAt }];

    await user.save();

    // 5. Attach HTTP-only cookie and return standard payload
    setRefreshTokenCookie(res, refreshToken);

    return sendSuccess(
      res,
      'User registered successfully',
      {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing user
 * @route POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    // 2. Validate password match
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    // 3. Generate new tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // 4. Prune expired tokens and append new refresh token
    const now = new Date();
    user.refreshTokens = (user.refreshTokens || []).filter((t) => t.expiresAt > now);
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();

    // 5. Attach HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    return sendSuccess(res, 'Login successful', {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Exchange refresh token for new access & rotated refresh token
 * @route POST /api/auth/refresh
 */
export const refreshToken = async (req, res, next) => {
  try {
    // 1. Extract refresh token from cookie or request body
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return next(ApiError.unauthorized('Refresh token is required.'));
    }

    // 2. Verify token signature
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtRefreshSecret);
    } catch {
      clearAuthCookies(res);
      return next(ApiError.unauthorized('Invalid or expired refresh token. Please sign in again.'));
    }

    // 3. Find user and check if token exists in active list (revocation check)
    const user = await User.findById(decoded.id);
    if (!user) {
      clearAuthCookies(res);
      return next(ApiError.unauthorized('User not found.'));
    }

    const tokenExists = user.refreshTokens.some((t) => t.token === token);
    if (!tokenExists) {
      // Possible token reuse / compromise detected -> revoke all sessions
      user.refreshTokens = [];
      await user.save();
      clearAuthCookies(res);
      return next(
        ApiError.unauthorized('Session compromised or token revoked. Please sign in again.')
      );
    }

    // 4. Token rotation: Remove used token and issue new pair
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();

    // 5. Update HTTP-only cookie
    setRefreshTokenCookie(res, newRefreshToken);

    return sendSuccess(res, 'Token refreshed successfully', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log out user and revoke session
 * @route POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded?.id) {
          await User.findByIdAndUpdate(decoded.id, {
            $pull: { refreshTokens: { token } },
          });
        }
      } catch {
        // Continue clearing cookies even if decode fails
      }
    }

    clearAuthCookies(res);

    return sendSuccess(res, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * @route GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  return sendSuccess(res, 'User profile retrieved successfully', {
    user: req.user.toJSON(),
  });
};
