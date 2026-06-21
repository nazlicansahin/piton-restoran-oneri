import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type SqlClient = NeonQueryFunction<boolean, boolean>;

let client: SqlClient | null = null;

function getClient(): SqlClient {
  if (client) return client;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set; database-backed routes will fail.");
  }

  client = neon(connectionString);
  return client;
}

function sqlTag(
  strings: TemplateStringsArray,
  ...params: unknown[]
): ReturnType<SqlClient> {
  return getClient()(strings, ...params);
}

// Preserve neon helpers (e.g. sql.transaction) while deferring connection setup.
sqlTag.transaction = ((...args: Parameters<SqlClient["transaction"]>) =>
  getClient().transaction(...args)) as SqlClient["transaction"];

/**
 * Neon serverless SQL tag. Safe for Vercel serverless functions.
 * Lazy-init so importing API routes during `next build` does not require
 * a live database when DATABASE_URL is unset (CI, local map-only dev).
 */
export const sql = sqlTag as SqlClient;
