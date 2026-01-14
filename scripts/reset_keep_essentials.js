const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { projects, tasks } = require('../lib/schema_cjs');
const { notInArray } = require('drizzle-orm');

const sqlite = new Database('finance.db');
const db = drizzle(sqlite);

async function resetData() {
    console.log('--- INICIANDO RESETEO DE DATOS ---');

    // 1. Delete all tasks
    console.log('1. Eliminando todas las tareas...');
    db.delete(tasks).run();
    console.log('   ✓ Tareas eliminadas.');

    // 2. Delete projects except 'Ahorro 10%' and 'Gastos Comunes'
    console.log('2. Eliminando proyectos (excepto estructurales)...');

    // Using simple logic: delete where name is NOT in the keep list
    // Note: drizzle-orm/better-sqlite3 syntax might vary, using raw SQL or multiple deletes is safer if unsure of "notInArray" support in this specific version context, 
    // but notInArray is standard Drizzle.

    // Safety check: specific deletion to avoid accidents
    const structuralProjectNames = ['Ahorro 10%', 'Gastos Comunes'];

    db.delete(projects)
        .where(notInArray(projects.name, structuralProjectNames))
        .run();

    console.log('   ✓ Proyectos eliminados (Ahorro 10% y Gastos Comunes conservados).');

    console.log('3. Master Data (Empleados, Movimientos, Documentos) conservados.');

    console.log('--- RESETEO COMPLETADO ---');
}

resetData().catch(console.error);
