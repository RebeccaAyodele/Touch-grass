
import { ClientSession, MongoClient, Db } from 'mongodb';
import * as dns from 'node:dns';

// Keep this temporarily because your default DNS had issues.
dns.setServers(['8.8.8.8', '1.1.1.1']);

let client: MongoClient | null = null;
let dbInstance: Db | null = null;

export interface DatabaseConfig {
  uri: string;
  dbName: string;
}

export async function connectDatabase(config: DatabaseConfig): Promise<Db> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!config.uri) {
    throw new Error('MONGODB_URI is required to connect to database.');
  }

  client = new MongoClient(config.uri, {
  maxPoolSize: 20,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 15000,
  autoSelectFamily: false,
});

  await client.connect();

  dbInstance = client.db(config.dbName || 'touch_grass');
  console.log('[Database] Connected successfully.');

  return dbInstance;
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
  if (client) {
    await client.close();
    client = null;
    dbInstance = null;
  }
}
