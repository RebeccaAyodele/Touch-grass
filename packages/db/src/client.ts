import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let dbInstance: Db | null = null;

export interface DatabaseConfig {
  uri: string;
  dbName: string;
}

/**
 * Initializes and connects the singleton MongoDB client.
 */
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
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  dbInstance = client.db(config.dbName || 'touch_grass');
  return dbInstance;
}

/**
 * Returns the active Db instance, or throws if not connected.
 */
export function getDb(): Db {
  if (!dbInstance) {
    throw new Error('Database is not initialized. Call connectDatabase() first.');
  }
  return dbInstance;
}

/**
 * Gracefully closes the database connection.
 */
export async function disconnectDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    dbInstance = null;
  }
}
