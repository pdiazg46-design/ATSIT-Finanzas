const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { movements } = require('../lib/schema_cjs');
const { eq } = require('drizzle-orm');

const sqlite = new Database('finance.db');
const db = drizzle(sqlite);

async function addMovements() {
    console.log('Adding new movements...');

    try {
        const newMovs = [
            { name: 'Caja Ingreso', type: 'Ingreso' },
            { name: 'Caja Gasto', type: 'Gasto' }
        ];

        for (const mov of newMovs) {
            // Check if exists
            const existing = await db.select().from(movements).where(eq(movements.name, mov.name)).get();

            if (!existing) {
                const inserted = await db.insert(movements).values(mov).returning().get();
                console.log(`✅ Created: ${inserted.name} (${inserted.type})`);
            } else {
                console.log(`ℹ️ Already exists: ${mov.name}`);
            }
        }
        console.log('Done.');
    } catch (error) {
        console.error('Error adding movements:', error);
    }
}

addMovements();
