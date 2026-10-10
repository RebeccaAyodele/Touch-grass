import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserRepository } from '@touch-grass/db';
import { UserResponse } from '@touch-grass/shared';

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

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await UserRepository.findByIdResponse(payload.userId);

    if (!user) {
      res.status(401).json({ error: 'User no longer exists.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
