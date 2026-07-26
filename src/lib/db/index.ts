import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const client = postgres(connectionString, {
  prepare: false,        // an toàn với pooler (transaction mode) không hỗ trợ prepared statements
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,   // fail fast nếu connection chậm thay vì retry mãi
});

export const db = drizzle(client, { schema });
export type DB = typeof db;
