const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { projects, tasks, movements } = require('../lib/schema_cjs');
const { eq, like, desc } = require('drizzle-orm');

const sqlite = new Database('finance.db');
const db = drizzle(sqlite);

async function inspect() {
    console.log('--- Inspecting "Gastos Comunes" ---');

    // 1. Find projects named 'Gastos Comunes' or similar
    const projs = await db.select().from(projects).where(like(projects.name, '%Gastos Comunes%')).all();

    if (projs.length === 0) {
        console.log('No project found with name "Gastos Comunes". Listing all projects:');
        const allProjs = await db.select({ id: projects.id, name: projects.name }).from(projects).all();
        console.table(allProjs);
        return;
    }

    console.log(`Found ${projs.length} project(s):`);
    console.table(projs.map(p => ({ id: p.id, name: p.name })));

    for (const p of projs) {
        console.log(`\nTasks for Project ID ${p.id} (${p.name}):`);
        const projTasks = await db.select({
            id: tasks.id,
            title: tasks.title,
            netValue: tasks.netValue,
            movementId: tasks.movementId,
            status: tasks.status
        })
            .from(tasks)
            .where(eq(tasks.projectId, p.id))
            .orderBy(desc(tasks.id))
            .all();

        // Enrich with movement names
        const allMovs = await db.select().from(movements).all();
        const enriched = projTasks.map(t => {
            const m = allMovs.find(mov => mov.id === t.movementId);
            return { ...t, movementName: m ? m.name : 'Unknown', movementType: m ? m.type : 'Unknown' };
        });

        console.table(enriched);
    }
}

inspect();
