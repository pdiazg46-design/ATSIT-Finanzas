import { db } from '@/lib/db';
import { tasks, projects, movements, documents } from '@/lib/schema';
import { eq, isNull, or, desc } from 'drizzle-orm';
import { hasPermission } from '@/lib/user-actions';
import { PERMISSIONS } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import PendingPaymentsList from '@/components/PendingPaymentsList';

export const dynamic = 'force-dynamic';

export default async function PendingPaymentsPage() {
    const canManageTasks = await hasPermission(PERMISSIONS.MANAGE_TASKS);
    if (!canManageTasks) {
        redirect('/reports');
    }

    // Obtener tareas que no tengan fecha de pago (nula o vacía)
    const pendingTasks = await db.select({
        id: tasks.id,
        title: tasks.title,
        projectName: projects.name,
        movementName: movements.name,
        movementType: movements.type,
        documentName: documents.name,
        docNumber: tasks.docNumber,
        netValue: tasks.netValue,
        totalValue: tasks.totalValue,
        dueDate: tasks.dueDate,
        startDate: tasks.startDate,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(movements, eq(tasks.movementId, movements.id))
    .leftJoin(documents, eq(tasks.documentId, documents.id))
    .where(or(
        isNull(tasks.paymentDate),
        eq(tasks.paymentDate, '')
    ))
    .orderBy(desc(tasks.dueDate))
    .all();

    return <PendingPaymentsList initialTasks={pendingTasks} />;
}
