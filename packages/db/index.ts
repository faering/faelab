import { Pool, type QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Fail fast so API startup makes misconfig obvious.
  throw new Error('DATABASE_URL is not set');
}

export const pool = new Pool({ connectionString });

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T | null> {
  const result = await pool.query<T>(text, params);
  return result.rows[0] ?? null;
}

export async function closePool() {
  await pool.end();
}
