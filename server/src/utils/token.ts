import jwt from 'jsonwebtoken';
import { Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
};

export const setTokenCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh',
  });
};

export const clearTokenCookies = (res: Response): void => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
};
