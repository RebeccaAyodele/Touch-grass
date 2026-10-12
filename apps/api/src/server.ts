import { app } from './app.js';
import { env } from './config/env.js';
import { disconnectDatabase } from '@touch-grass/db';

// Start HTTP immediately. Database connection and indexes are initialized on
// the first data-backed request, which lets serverless instances return a
// controlled 503 instead of exiting during a cold start.
const server = app.listen(env.API_PORT, () => {
  console.log(`Touch Grass API listening on port ${env.API_PORT}/api/v1`);
  console.log(`AI Provider active: ${env.AI_PROVIDER} (${env.AI_MODEL})`);
});

let shuttingDown = false;
const shutdown = () => {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close(() => {
    void disconnectDatabase().finally(() => process.exit(0));
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
