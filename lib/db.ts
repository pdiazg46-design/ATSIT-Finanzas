const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('CRITICAL ERROR: DATABASE_URL is missing in Vercel environment variables.');
    }
    console.warn('⚠️ No DATABASE_URL found, falling back to local SQLite file.');
}

const client = createClient({
    url: url || 'file:finance.db',
    authToken,
});

export const db = drizzle(client, { schema });
