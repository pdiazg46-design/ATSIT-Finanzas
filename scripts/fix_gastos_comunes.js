const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { tasks, movements, projects } = require('../lib/schema_cjs');
const { eq } = require('drizzle-orm');

const sqlite = new Database('finance.db');
const db = drizzle(sqlite);

async function fix() {
    console.log('--- Fixing Task 3040 ---');

    // 1. Get "Caja Ingreso" ID
    const incomeMov = await db.select().from(movements).where(eq(movements.name, 'Caja Ingreso')).get();
    if (!incomeMov) {
        console.error('❌ Error: "Caja Ingreso" movement not found. Run add_cash_movements.js first.');
        return;
    }

    // 2. Get the task
    const task = await db.select().from(tasks).where(eq(tasks.id, 3040)).get();
    if (!task) {
        console.error('❌ Error: Task 3040 not found.');
        return;
    }

    console.log('Current Task:', { id: task.id, title: task.title, net: task.netValue, mov: task.movementId });

    // 3. Update
    // Turn negative to positive using Math.abs
    const newNet = Math.abs(task.netValue);

    await db.update(tasks)
        .set({
            movementId: incomeMov.id,
            netValue: newNet,
            totalValue: newNet, // Assuming cash has no tax for now or tax is 0. If there was tax, it needs recalc, but user said "caja ingreso" which usually implies direct cash.
            taxValue: 0, // Reset tax to 0 for simple cash entry unless specified otherwise.
            lastActionAt: new Date().toISOString()
        })
        .where(eq(tasks.id, 3040))
        .run();

    console.log(`✅ Fixed Task 3040: Set movement to ${incomeMov.name} (${incomeMov.id}), Net Value to ${newNet}`);

    // Update project timestamp too
    await db.update(projects)
        .set({ lastActionAt: new Date().toISOString() })
        .where(eq(projects.id, task.projectId))
        .run();
}

fix();
