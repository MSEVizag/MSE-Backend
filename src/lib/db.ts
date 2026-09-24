import { getLogger } from '@logtape/logtape';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const logger = getLogger(['ms-engineering-logs', 'database']);

if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL environment variable is missing.');
    throw new Error('DATABASE_URL is required.');
}

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

export async function verifyDatabaseConnection() {
    try {
        await sql`SELECT 1`;
        logger.info('Successfully connected to the Neon database.');
    } catch (error) {
        logger.error('Failed to connect to Neon database: {error}', {
            error: error instanceof Error ? error.message : String(error)
        });
        throw error;
    }
}