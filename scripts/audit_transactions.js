
const { db } = require('../lib/db');
const { tasks, documents, projects, movements } = require('../lib/schema_cjs');
const { eq, desc } = require('drizzle-orm');

async function inspectTransactions() {
    console.log('Fetching transactions for audit...');
    try {
        const results = await db.select({
            date: tasks.paymentDate,
            title: tasks.title,
            docNumber: tasks.docNumber,
            document: documents.name,
            total: tasks.totalValue,
            projectName: projects.name,
            movement: movements.name
        })
            .from(tasks)
            .leftJoin(documents, eq(tasks.documentId, documents.id))
            .leftJoin(projects, eq(tasks.projectId, projects.id))
            .leftJoin(movements, eq(tasks.movementId, movements.id))
            .orderBy(desc(tasks.paymentDate))
            .all();

        console.log('Date | Title | Doc # | Total | Project');
        console.log('------------------------------------------------');
        results.forEach(r => {
            console.log(`${r.date} | ${r.title} | ${r.docNumber || '-'} | $${r.total} | ${r.projectName}`);
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

inspectTransactions();
