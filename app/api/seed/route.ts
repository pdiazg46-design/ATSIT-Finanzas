
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== 'PatricioTangente2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // AUTO-MIGRATION: Ensure tables exist
        // This is a manual fallback since we can't run 'drizzle-kit push' on Vercel easily
        await db.run(sql`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at TEXT DEFAULT (CURRENT_TIMESTAMP)
            );
        `);

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

        const email = 'pdiazg46@gmail.com';
        const password = await bcrypt.hash('123456', 10);

        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.email, email)).get();

        if (existingUser) {
            return NextResponse.json({ message: 'Database initialized. User already exists.', user: existingUser });
        }

        // Create user
        const newUser = await db.insert(users).values({
            name: 'Patricio Díaz',
            email,
            password,
            role: 'admin',
        }).returning().get();

        return NextResponse.json({ message: 'Database structure created and User added successfully', user: newUser });
    } catch (error) {
        console.error('Seed error:', error);

        // DEBUG: Expose config safery
        const dbUrl = process.env.DATABASE_URL || 'undefined';
        const maskedUrl = dbUrl.startsWith('file:')
            ? dbUrl
            : dbUrl.replace(/:([a-zA-Z0-9_\-]+)@/, ':***@');

        // Probe Raw Client
        let rawProbeResult = 'Skipped';
        try {
            const { createClient } = await import('@libsql/client');
            const rawClient = createClient({
                url: dbUrl.replace('libsql://', 'https://'),
                authToken: process.env.DATABASE_AUTH_TOKEN
            });
            await rawClient.execute('SELECT 1');
            rawProbeResult = 'Success';
        } catch (rawError) {
            rawProbeResult = 'Failed: ' + String(rawError);
        }

        const token = process.env.DATABASE_AUTH_TOKEN || '';

        return NextResponse.json({
            error: 'Failed to seed/migrate',
            debug: {
                urlPrefix: dbUrl.split(':')[0],
                hasUrl: !!dbUrl,
                hasToken: !!token,
                tokenPrefix: token.substring(0, 5) + '...',
                fullUrlMasked: maskedUrl,
                rawClientProbe: rawProbeResult
            },
            details: String(error)
        }, { status: 500 });
    }
}
