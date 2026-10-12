import { NextFunction, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { getDb } from '@touch-grass/db';
import type { AuthenticatedRequest } from './auth.js';
import type { Request } from 'express';
import { describeDatabaseError, ensureDatabase } from './database.js';

// Coarse per-instance ceiling for general traffic. Costly auth and AI routes
// below also use shared MongoDB buckets to enforce quotas across instances.
import rateLimit from 'express-rate-limit';
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const AI_GENERATION_LIMIT = 10;
const AI_GENERATION_WINDOW_MS = 60 * 1000;
const AUTH_LIMIT = 30;
const AUTH_WINDOW_MS = 15 * 60 * 1000;

async function incrementSharedBucket(
  id: string,
  bucket: number,
  windowMs: number
): Promise<number> {
  const collection = getDb().collection<{ _id: string; count: number; expiresAt: Date }>('api_rate_limits');
  const expiresAt = new Date((bucket + 2) * windowMs);
  try {
    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, returnDocument: 'after' }
    );
    return result?.count ?? Number.MAX_SAFE_INTEGER;
  } catch (error) {
    if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
    const result = await collection.findOneAndUpdate(
      { _id: id }, { $inc: { count: 1 } }, { returnDocument: 'after' }
    );
    return result?.count ?? Number.MAX_SAFE_INTEGER;
  }
}

function sendLimitHeaders(res: Response, limit: number, count: number, resetAt: number): void {
  res.setHeader('RateLimit-Limit', String(limit));
  res.setHeader('RateLimit-Remaining', String(Math.max(0, limit - count)));
  res.setHeader('RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
}

export async function authLimiter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await ensureDatabase();
    const bucket = Math.floor(Date.now() / AUTH_WINDOW_MS);
    const resetAt = (bucket + 1) * AUTH_WINDOW_MS;
    const count = await incrementSharedBucket(`auth:${req.ip}:${bucket}`, bucket, AUTH_WINDOW_MS);
    sendLimitHeaders(res, AUTH_LIMIT, count, resetAt);
    if (count > AUTH_LIMIT) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))));
      res.status(429).json({ error: 'Too many authentication attempts, please try again later.' });
      return;
    }
    next();
  } catch (error) {
    console.error('[Rate limit] Shared authentication limiter is unavailable.', describeDatabaseError(error));
    res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'The database is temporarily unavailable. Please try again shortly.',
    });
  }
}

/** Shared per-account AI quota, so separate Vercel instances enforce the same limit. */
export async function aiGenerationLimiter(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const bucket = Math.floor(Date.now() / AI_GENERATION_WINDOW_MS);
  const id = `ai-generation:${userId}:${bucket}`;
  try {
    const resetAt = (bucket + 1) * AI_GENERATION_WINDOW_MS;
    const count = await incrementSharedBucket(id, bucket, AI_GENERATION_WINDOW_MS);
    sendLimitHeaders(res, AI_GENERATION_LIMIT, count, resetAt);
    if (count > AI_GENERATION_LIMIT) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))));
      res.status(429).json({ error: 'Quest generation rate limit reached. Please wait a moment.' });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}
