import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;
import { createClient } from '@libsql/client';
if (!url) {
    console.error('⚠️ CRITICAL: DATABASE_URL is missing. DB queries will fail. (This is expected during build if env vars are unset)');
}

// Turso/Vercel compatibility: Force HTTPS instead of libsql (WebSocket) to avoid "Failed query"
const finalUrl = url?.replace('libsql://', 'https://') || 'file:finance.db';

// Fix: Strip quotes if user added them in Vercel env vars
const cleanToken = authToken?.replace(/^['"]|['"]$/g, '');

const client = createClient({
    url: finalUrl,
    authToken: cleanToken,
});

export const db = drizzle(client, { schema });
