import { config } from '../config/env.js';

/**
 * Cookie options for secure token storage
 */
export const getRefreshTokenCookieOptions = () => {
  const isProduction = config.isProduction;
  return {
    httpOnly: true, // Inaccessible to JavaScript (XSS mitigation)
    secure: isProduction, // HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF mitigation
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
  };
};

/**
 * Attach refresh token to response cookie
 * @param {import('express').Response} res
 * @param {string} refreshToken
 */
export const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());
};

/**
 * Clear refresh token cookie on logout
 * @param {import('express').Response} res
 */
export const clearAuthCookies = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'strict' : 'lax',
    path: '/',
  });
};
