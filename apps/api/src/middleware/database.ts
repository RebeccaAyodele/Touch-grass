import { NextFunction, Request, Response } from 'express';
import { connectDatabase, ensureDatabaseIndexes } from '@touch-grass/db';
import { env } from '../config/env.js';

let initialization: Promise<void> | null = null;
let databaseIsReady = false;

export async function ensureDatabase(): Promise<void> {
  if (!initialization) {
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
    console.error('[Database] Request unavailable because database initialization failed.', error);
    res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'The database is temporarily unavailable. Please try again shortly.',
    });
  }
}
