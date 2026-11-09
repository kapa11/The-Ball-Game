import "dotenv/config";

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema.ts";

// Ensure the database connection string exists.
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

// Create a bounded PostgreSQL connection pool.
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
});

// Initialize Drizzle with our application schema.
export const db = drizzle(pool, { schema });