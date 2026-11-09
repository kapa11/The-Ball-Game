import { sql } from "drizzle-orm";
import { db } from "./client.ts";

export async function checkDatabaseHealth(): Promise<boolean> {
    try {
        await db.execute(sql`SELECT 1`);
        return true;
    } catch (error) {
        console.error("Database health check failed:", error);
        return false;
    }
}