
import 'dotenv/config';
import { db } from './lib/db';
import { tasks } from './lib/schema';
import { sql } from 'drizzle-orm';

async function checkPaymentDates() {
    try {
        console.log('Checking database connection...');
        const allTasks = await db.select({
            id: tasks.id,
            title: tasks.title,
            netValue: tasks.netValue,
            totalValue: tasks.totalValue,
            status: tasks.status,
            paymentDate: tasks.paymentDate,
            startDate: tasks.startDate
        }).from(tasks).limit(20);

        const tasksWithPaymentDate = await db.select({ count: sql<number>`count(*)` })
            .from(tasks)
            .where(sql`${tasks.paymentDate} IS NOT NULL AND ${tasks.paymentDate} != ''`)
            .get();

        const tasksCompletado = await db.select({ count: sql<number>`count(*)` })
            .from(tasks)
            .where(sql`${tasks.status} = 'Completado'`)
            .get();

        console.log('--- Sample Tasks ---');
        console.table(allTasks);
        console.log('--- Summary ---');
        console.log(`Total tasks with paymentDate: ${tasksWithPaymentDate?.count}`);
        console.log(`Total tasks with status 'Completado': ${tasksCompletado?.count}`);
    } catch (error) {
        console.error('Error running script:', error);
    }
}

checkPaymentDates();
