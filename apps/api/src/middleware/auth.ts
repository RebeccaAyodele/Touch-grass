import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserRepository } from '@touch-grass/db';
import { UserResponse } from '@touch-grass/shared';
import { ensureDatabase } from './database.js';

export interface AuthenticatedRequest extends Request {
  user?: UserResponse;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please provide a Bearer token.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  let payload: { userId: string };
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
    return;
  }

  try {
    await ensureDatabase();
  } catch {
    res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'The database is temporarily unavailable. Please try again shortly.',
    });
    return;
  }

  try {
    const user = await UserRepository.findByIdResponse(payload.userId);

    if (!user) {
      res.status(401).json({ error: 'User no longer exists.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
