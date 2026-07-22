import { db } from '@/lib/db';
import { projects, tasks, movements, vatPayments } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import DashboardPBI from '@/components/DashboardPBI';

export default async function DashboardPage() {
  // Query all projects (active and archived)
  const allProjects = await db.select({
    id: projects.id,
    name: projects.name,
    status: projects.status,
    isArchived: projects.isArchived,
    expectedIncome: projects.expectedIncome
  }).from(projects).all();

  // Query only movement types that are actually used in tasks
  const allMovements = await db.selectDistinct({
    id: movements.id,
    name: movements.name,
    type: movements.type
  })
    .from(movements)
    .innerJoin(tasks, eq(tasks.movementId, movements.id))
    .all();

  // Query all individual movements (tasks) with their joins
  const allTasks = await db.select({
    id: tasks.id,
    title: tasks.title,
    netValue: tasks.netValue,
    totalValue: tasks.totalValue,
    startDate: tasks.startDate,
    documentId: tasks.documentId,
    projectId: tasks.projectId,
    projectName: projects.name,
    projectIsArchived: projects.isArchived,
    movementId: tasks.movementId,
    movementName: movements.name,
    movementType: movements.type,
    observations: tasks.observations
  })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(movements, eq(tasks.movementId, movements.id))
    .orderBy(desc(tasks.startDate))
    .all();

  // Query all VAT Payments
  const allVatPayments = await db.select().from(vatPayments).all();

  return (
    <DashboardPBI
      initialProjects={allProjects}
      initialMovements={allMovements}
      initialTasks={allTasks}
      initialVatPayments={allVatPayments}
    />
  );
}
