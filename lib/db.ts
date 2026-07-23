import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;
import { createClient } from '@libsql/client';
import { sql } from 'drizzle-orm';

if (!url) {
    console.error('⚠️ CRITICAL: DATABASE_URL is missing. DB queries will fail. (This is expected during build if env vars are unset)');
}

import { getDataDirectory } from './paths';
import { join } from 'path';

let finalUrl = 'file:finance.db';
const isDesktopApp = process.env.ELECTRON_RUN_AS_NODE === '1' || !process.env.VERCEL;

if (isDesktopApp) {
    const dataDir = getDataDirectory();
    finalUrl = `file:${join(dataDir, 'finance.db')}`;
} else if (url) {
    finalUrl = url.replace('libsql://', 'https://');
}

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

        // AUTO-SEED: Insert original movement types if missing
        const existingMovs = await db.select().from(schema.movements).all();
        const existingNames = new Set(existingMovs.map(m => m.name.toLowerCase()));
        
        const defaultMovements = [
            { name: 'Pago Cliente (Ingreso)', type: 'Ingreso' },
            { name: 'Venta Materiales / Servicios', type: 'Ingreso' },
            { name: 'Aporte de Capital', type: 'Ingreso' },
            { name: 'Caja Ingreso', type: 'Ingreso' },
            { name: 'Otros Ingresos', type: 'Ingreso' },
            { name: 'Servicios Profesionales / Contratistas', type: 'Gasto' },
            { name: 'Remuneraciones / Honorarios', type: 'Gasto' },
            { name: 'Materiales Obra', type: 'Gasto' },
            { name: 'Mano de Obra', type: 'Gasto' },
            { name: 'Arriendo Maquinaria', type: 'Gasto' },
            { name: 'Gastos Generales', type: 'Gasto' },
            { name: 'Gastos de Oficina / Gastos Comunes', type: 'Gasto' },
            { name: 'Gastos Financieros', type: 'Gasto' },
            { name: 'Retiros Socios', type: 'Gasto' },
            { name: 'Caja Gasto', type: 'Gasto' },
            { name: 'Otros Gastos', type: 'Gasto' }
        ];

        const toInsertMovs = defaultMovements.filter(m => !existingNames.has(m.name.toLowerCase()));
        if (toInsertMovs.length > 0) {
            await db.insert(schema.movements).values(toInsertMovs).run();
        }

        // AUTO-SEED: Insert standard Chilean DTE document types if missing
        const existingDocs = await db.select().from(schema.documents).all();
        const existingDocNames = new Set(existingDocs.map(d => d.name.toLowerCase()));

        const defaultDocuments = [
            { name: 'Factura Electrónica' },
            { name: 'Factura Exenta Electrónica' },
            { name: 'Boleta Electrónica' },
            { name: 'Boleta Exenta Electrónica' },
            { name: 'Boleta de Honorarios' },
            { name: 'Nota de Crédito Electrónica' },
            { name: 'Nota de Débito Electrónica' },
            { name: 'Guía de Despacho Electrónica' },
            { name: 'Comprobante de Transferencia' },
            { name: 'Liquidación de Sueldo' },
            { name: 'Comprobante Interno / Sin Documento' }
        ];

        const toInsertDocs = defaultDocuments.filter(d => !existingDocNames.has(d.name.toLowerCase()));
        if (toInsertDocs.length > 0) {
            await db.insert(schema.documents).values(toInsertDocs).run();
        }
    } catch (error) {
        console.error('Failed to initialize database tables:', error);
    }
}
