const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { employees, movements } = require('../lib/schema_cjs');
const { eq, like } = require('drizzle-orm');

const sqlite = new Database('finance.db');
const db = drizzle(sqlite);

async function checkData() {
    console.log('--- CHECKING DATA FOR WITHDRAWALS ---');

    // 1. Check Movement "Retiro"
    let retiro = db.select().from(movements).where(eq(movements.name, 'Retiro')).get();
    if (!retiro) {
        console.log('X Movimiento "Retiro" no existe. Creándolo...');
        retiro = db.insert(movements).values({ name: 'Retiro', type: 'Gasto' }).returning().get();
    } else {
        console.log('✓ Movimiento "Retiro" existe.');
    }

    // 2. Check Partners
    const francisca = db.select().from(employees).where(like(employees.firstName, '%Francisca%')).get();
    const andrea = db.select().from(employees).where(like(employees.firstName, '%Andrea%')).get();

    if (francisca) console.log(`✓ Socia encontrada: ${francisca.firstName} ${francisca.lastName} (ID: ${francisca.id})`);
    else console.log('X Francisca no encontrada.');

    if (andrea) console.log(`✓ Socia encontrada: ${andrea.firstName} ${andrea.lastName} (ID: ${andrea.id})`);
    else console.log('X Andrea no encontrada.');
}

checkData();
