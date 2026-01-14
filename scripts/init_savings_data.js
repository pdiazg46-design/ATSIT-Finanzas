const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { projects, employees, movements } = require('../lib/schema_cjs');
const { eq } = require('drizzle-orm');

const sqlite = new Database('finance.db');
const db = drizzle(sqlite);

async function initSavingsData() {
    console.log('--- INICIALIZANDO DATOS DE AHORRO/GASTOS COMUNES ---');

    // 1. Ensure movements exist
    const requiredMovements = [
        { name: 'Ahorro 10%', type: 'Gasto' },
        { name: 'Gastos Comunes', type: 'Gasto' }
    ];

    for (const mov of requiredMovements) {
        // Check if exists
        const existing = db.select().from(movements).where(eq(movements.name, mov.name)).get();
        if (!existing) {
            db.insert(movements).values(mov).run();
            console.log(`✓ Movimiento creado: ${mov.name}`);
        } else {
            console.log(`- Movimiento ya existe: ${mov.name}`);
        }
    }

    // 2. Ensure projects exist
    // We need an owner. Let's grab the first employee.
    const owner = db.select().from(employees).limit(1).get();
    if (!owner) {
        console.error('Error: No hay empleados para asignar como dueños de los proyectos.');
        return;
    }

    const requiredProjects = [
        { name: 'Ahorro 10%', description: 'Fondo de ahorro generado por transferencias automáticas.' },
        { name: 'Gastos Comunes', description: 'Fondo para gastos comunes generado por transferencias automáticas.' }
    ];

    for (const proj of requiredProjects) {
        const existing = db.select().from(projects).where(eq(projects.name, proj.name)).get();
        if (!existing) {
            db.insert(projects).values({
                name: proj.name,
                description: proj.description,
                ownerId: owner.id,
                category: 'Interno',
                status: 'En curso',
                startDate: new Date().toISOString(),
                expectedIncome: 0,
                lastActionAt: new Date().toISOString()
            }).run();
            console.log(`✓ Proyecto creado: ${proj.name}`);
        } else {
            console.log(`- Proyecto ya existe: ${proj.name}`);
        }
    }

    console.log('--- INICIALIZACIÓN COMPLETADA ---');
}

initSavingsData().catch(err => {
    console.error('Error:', err);
});
