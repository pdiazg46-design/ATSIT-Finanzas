import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;
import { createClient } from '@libsql/client';
if (!url) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('CRITICAL ERROR: DATABASE_URL is missing in Vercel environment variables.');
    }
    console.warn('⚠️ No DATABASE_URL found, falling back to local SQLite file.');
}

// Turso/Vercel compatibility: Force HTTPS instead of libsql (WebSocket) to avoid "Failed query"
const finalUrl = url?.replace('libsql://', 'https://') || 'file:finance.db';

const client = createClient({
    url: finalUrl,
    authToken,
});

export const db = drizzle(client, { schema });
