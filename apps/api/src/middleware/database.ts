import { NextFunction, Request, Response } from 'express';
import { connectDatabase, ensureDatabaseIndexes } from '@touch-grass/db';
import { env } from '../config/env.js';

let initialization: Promise<void> | null = null;
let databaseIsReady = false;

export function describeDatabaseError(error: unknown): Record<string, string | number> {
  if (!(error instanceof Error)) return { message: 'Unknown database error' };
  const code = (error as Error & { code?: unknown }).code;
  return {
    name: error.name,
    message: error.message.replace(/mongodb(?:\+srv)?:\/\/\S+/gi, '[MongoDB URI redacted]'),
    ...(typeof code === 'string' || typeof code === 'number' ? { code } : {}),
  };
}

export async function ensureDatabase(): Promise<void> {
  if (!initialization) {
    const deployed = env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    const pointsToLocalhost = /^mongodb(?:\+srv)?:\/\/(?:[^@/]+@)?(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::|\/)/i.test(env.MONGODB_URI);
    if (deployed && pointsToLocalhost) {
      throw new Error('MONGODB_URI is missing or points to localhost in the deployed environment.');
    }

    initialization = connectDatabase({ uri: env.MONGODB_URI, dbName: env.MONGODB_DATABASE })
      .then(() => ensureDatabaseIndexes())
      .then(() => { databaseIsReady = true; })
      .catch((error: unknown) => {
        initialization = null;
        databaseIsReady = false;
        throw error;
      });
  }
  await initialization;
}

export function isDatabaseReady(): boolean {
  return databaseIsReady;
}

export async function requireDatabase(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await ensureDatabase();
    next();
  } catch (error) {
    console.error('[Database] Request unavailable because database initialization failed.', describeDatabaseError(error));
    res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'The database is temporarily unavailable. Please try again shortly.',
    });
  }
}
