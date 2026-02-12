
import { db } from './lib/db';
import { tasks, projects } from './lib/schema';
import { eq, or, like } from 'drizzle-orm';

async function checkData() {
    const allTasks = await db.select({
        id: tasks.id,
        projectId: tasks.projectId,
        projectName: projects.name,
        title: tasks.title,
        netValue: tasks.netValue,
        taxValue: tasks.taxValue,
        totalValue: tasks.totalValue
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(or(
        like(projects.name, '%Citylab%'),
        eq(tasks.netValue, 200000),
        eq(tasks.netValue, -200000)
    ))
    .all();

    console.log(JSON.stringify(allTasks, null, 2));
}

checkData();
