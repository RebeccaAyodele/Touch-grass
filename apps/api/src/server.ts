import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, ensureDatabaseIndexes, disconnectDatabase } from '@touch-grass/db';

async function bootstrap() {
  try {
    console.log(`[Database] Connecting to MongoDB (${env.MONGODB_DATABASE})...`);
    await connectDatabase({
      uri: env.MONGODB_URI,
      dbName: env.MONGODB_DATABASE,
    });
    console.log('[Database] Connected successfully.');

    console.log('[Database] Ensuring indexes...');
    await ensureDatabaseIndexes();
    console.log('[Database] Indexes ensured.');

    const server = app.listen(env.API_PORT, () => {
      console.log(`🌿 Touch Grass API running on http://localhost:${env.API_PORT}/api/v1`);
      console.log(`🎯 AI Provider active: ${env.AI_PROVIDER} (${env.AI_MODEL})`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Shutting down gracefully...');
      server.close(async () => {
        await disconnectDatabase();
        console.log('[Server] Closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err: any) {
    console.error('[Server Bootstrap Error]:', err.message);
    if (env.NODE_ENV === 'development') {
      console.warn('⚠️ Starting Express server in standalone / test mode without DB connection.');
      app.listen(env.API_PORT, () => {
        console.log(`🌿 Touch Grass API running in fallback mode on http://localhost:${env.API_PORT}/api/v1`);
      });
    } else {
      process.exit(1);
    }
  }
}

bootstrap();
