import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;
import { createClient } from '@libsql/client';
import { sql } from 'drizzle-orm';

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

export async function initializeDatabase() {
    try {
        await db.run(sql`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
                permissions TEXT
            );
        `);

        // Check and patch if column permissions is missing (safeguard)
        try {
            await db.run(sql`ALTER TABLE users ADD COLUMN permissions TEXT`);
        } catch (e) {
            // Column already exists
        }

        await db.run(sql`
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                organization TEXT,
                position TEXT,
                email TEXT,
                phone_mobile TEXT,
                phone_work TEXT,
                phone_home TEXT,
                phone_fax TEXT,
                address TEXT,
                city TEXT,
                state_province TEXT,
                zip_postal_code TEXT,
                country_region TEXT,
                web_page TEXT,
                notes TEXT
            );
        `);

        await db.run(sql`
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                owner_id INTEGER REFERENCES employees(id),
                category TEXT,
                status TEXT DEFAULT 'En curso',
                priority TEXT DEFAULT '(2) Normal',
                start_date TEXT,
                end_date TEXT,
                expected_income REAL DEFAULT 0,
                expected_utility REAL DEFAULT 0,
                budget_days REAL DEFAULT 0,
                notes TEXT,
                observations TEXT,
                last_action_at TEXT,
                is_archived INTEGER DEFAULT 0
            );
        `);

        await db.run(sql`
            CREATE TABLE IF NOT EXISTS movements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT DEFAULT 'Gasto'
            );
        `);

        await db.run(sql`
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            );
        `);

        await db.run(sql`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL REFERENCES projects(id),
                title TEXT NOT NULL,
                employee_id INTEGER REFERENCES employees(id),
                movement_id INTEGER REFERENCES movements(id),
                document_id INTEGER REFERENCES documents(id),
                doc_number TEXT,
                status TEXT DEFAULT 'En curso',
                net_value REAL DEFAULT 0,
                tax_value REAL DEFAULT 0,
                total_value REAL DEFAULT 0,
                cost_days REAL DEFAULT 0,
                start_date TEXT,
                due_date TEXT,
                payment_date TEXT,
                description TEXT,
                observations TEXT,
                last_action_at TEXT
            );
        `);

        await db.run(sql`
            CREATE TABLE IF NOT EXISTS vat_payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                payment_date TEXT NOT NULL,
                amount REAL NOT NULL DEFAULT 0,
                notes TEXT,
                created_at TEXT
            );
        `);
    } catch (error) {
        console.error('Failed to initialize database tables:', error);
    }
}
