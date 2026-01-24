import { Pool } from 'pg';

// Create and export a shared Postgres pool for use in the API
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper to run a query
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows;
}

// Helper to run a single row query
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const result = await pool.query(text, params);
  return result.rows[0] || null;
}
