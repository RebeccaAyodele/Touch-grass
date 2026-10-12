
import { ClientSession, MongoClient, Db } from 'mongodb';
import * as dns from 'node:dns';

// Keep this temporarily because your default DNS had issues.
dns.setServers(['8.8.8.8', '1.1.1.1']);

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let connectionPromise: Promise<Db> | null = null;

export interface DatabaseConfig {
  uri: string;
  dbName: string;
}

export function connectDatabase(config: DatabaseConfig): Promise<Db> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }
  if (connectionPromise) return connectionPromise;

  if (!config.uri) {
    return Promise.reject(new Error('MONGODB_URI is required to connect to database.'));
  }

  const nextClient = new MongoClient(config.uri, {
    maxPoolSize: 20,
    minPoolSize: 0,
    waitQueueTimeoutMS: 10000,
    serverSelectionTimeoutMS: 8000,
    autoSelectFamily: false,
  });

  connectionPromise = nextClient.connect()
    .then(() => {
      client = nextClient;
      dbInstance = nextClient.db(config.dbName || 'touch_grass');
      console.log('[Database] Connected successfully.');
      return dbInstance;
    })
    .catch(async (error: unknown) => {
      await nextClient.close().catch(() => undefined);
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
}

export function getDb(): Db {
  if (!dbInstance) {
    throw new Error('Database is not initialized. Call connectDatabase() first.');
  }

  return dbInstance;
}

/** Runs related database writes as one all-or-nothing transaction. */
export async function withDatabaseTransaction<T>(
  operation: (session: ClientSession) => Promise<T>
): Promise<T> {
  if (!client) {
    throw new Error('Database is not initialized. Call connectDatabase() first.');
  }

  const session = client.startSession();
  try {
    const result = await session.withTransaction(() => operation(session));
    if (result === undefined) {
      throw new Error('Database transaction completed without a result.');
    }
    return result;
  } finally {
    await session.endSession();
  }
}

export async function disconnectDatabase(): Promise<void> {
  const currentClient = client;
  client = null;
  dbInstance = null;
  connectionPromise = null;
  if (currentClient) await currentClient.close();
}
