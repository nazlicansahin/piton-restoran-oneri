import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Surfaced lazily so the public parts of the app still run without a DB.
  console.warn("DATABASE_URL is not set; database-backed routes will fail.");
}

/**
 * Neon serverless SQL tag. Safe for Vercel serverless functions.
 * Usage: const rows = await sql`select 1`;
 */
export const sql = neon(connectionString ?? "");
