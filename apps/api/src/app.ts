import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { isDatabaseReady } from './middleware/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/authRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { challengeRouter } from './routes/challengeRoutes.js';
import { evidenceRouter } from './routes/evidenceRoutes.js';
import { spaceRouter } from './routes/spaceRoutes.js';
import { leaderboardRouter } from './routes/leaderboardRoutes.js';

export const app = express();
export default app;

// Vercel overwrites X-Forwarded-For with the public client IP. Trust the
// platform's single forwarding hop in production so IP limits are per client.
if (env.NODE_ENV === 'production') app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: [env.WEB_ORIGIN, 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(globalLimiter);

// Health check
app.get('/api/v1/health/live', (_req, res) => {
  res.status(200).json({ status: 'alive' });
});

app.get('/api/v1/health', (_req, res) => {
  const database = isDatabaseReady() ? 'connected' : 'unavailable';
  res.status(database === 'connected' ? 200 : 503).json({
    status: database === 'connected' ? 'healthy' : 'degraded',
    database,
    timestamp: new Date().toISOString(),
    aiProvider: env.AI_PROVIDER,
    model: env.AI_MODEL,
    version: '1.0.0-mvp',
  });
});

// Register API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/challenges', challengeRouter);
app.use('/api/v1/evidence', evidenceRouter);
app.use('/api/v1/spaces', spaceRouter);
app.use('/api/v1/leaderboard', leaderboardRouter);

// Global Error Handler
app.use(errorHandler);
