"use server";

import { db } from '@/lib/db';
import { tasks, movements, projects, documents } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { hasPermission } from '@/lib/user-actions';
import { PERMISSIONS } from '@/lib/permissions';

export async function createTask(data: any) {
    if (!await hasPermission(PERMISSIONS.MANAGE_TASKS)) {
        return { success: false, message: 'No tienes permiso para crear tareas' };
    }

    const { netValue, documentId, movementId, observations, ...rest } = data;

    // Fetch movement type to determine sign
    const movement = await db.select().from(movements).where(eq(movements.id, movementId)).get();
    const type = movement?.type || 'Gasto';

    // Ensure correct sign: positive for Ingreso, negative for Gasto
    const absoluteValue = Math.round(Math.abs(netValue || 0));
    const adjustedNetValue = type === 'Ingreso' ? absoluteValue : -absoluteValue;

    // Verify document type for Tax and Nota de Crédito sign inversion
    const document = await db.select().from(documents).where(eq(documents.id, documentId)).get();

    let taxValue = 0;
    let signMultiplier = 1;

    if (document) {
        const docName = (document.name || '').toLowerCase();
        const isCreditNote = docName.includes('nota de crédito') || docName.includes('nota de credito');
        const isDebitNote = docName.includes('nota de débito') || docName.includes('nota de debito');
        const isInvoice = docName.includes('factura') || isCreditNote || isDebitNote;
        const isHonorarium = docName.includes('boleta') && docName.includes('honorario');

        if (isInvoice) {
            taxValue = Math.round(adjustedNetValue * 0.19);
        } else if (isHonorarium) {
            // Honorarium Logic (2026: 15.25%)
            const rate = 0.1525;
            taxValue = Math.round(adjustedNetValue * (rate / (1 - rate)));
        }

        // Nota de Crédito reverses the transaction sign
        if (isCreditNote) {
            signMultiplier = -1;
        }
    }

    const finalNetValue = adjustedNetValue * signMultiplier;
    const finalTaxValue = taxValue * signMultiplier;
    const totalValue = finalNetValue + finalTaxValue;

    await db.insert(tasks).values({
        ...rest,
        movementId,
        documentId,
        netValue: finalNetValue,
        taxValue: finalTaxValue,
        totalValue,
        observations,
        lastActionAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    // Update parent project last action
    await db.update(projects)
        .set({ lastActionAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
        .where(eq(projects.id, rest.projectId));

    revalidatePath(`/projects/${rest.projectId}`);
    revalidatePath('/');
    return { success: true };
}

export async function updateTask(id: number, data: any) {
    if (!await hasPermission(PERMISSIONS.MANAGE_TASKS)) {
        return { success: false, message: 'No tienes permiso para editar tareas' };
    }

    const { netValue, documentId, movementId, observations, ...rest } = data;

    // Fetch movement type to determine sign
    const movement = await db.select().from(movements).where(eq(movements.id, movementId)).get();
    const type = movement?.type || 'Gasto';

    // Ensure correct sign: positive for Ingreso, negative for Gasto
    const absoluteValue = Math.round(Math.abs(netValue || 0));
    const adjustedNetValue = type === 'Ingreso' ? absoluteValue : -absoluteValue;

    // Verify document type for Tax and Nota de Crédito sign inversion
    const document = await db.select().from(documents).where(eq(documents.id, documentId)).get();

    let taxValue = 0;
    let signMultiplier = 1;

    if (document) {
        const docName = (document.name || '').toLowerCase();
        const isCreditNote = docName.includes('nota de crédito') || docName.includes('nota de credito');
        const isDebitNote = docName.includes('nota de débito') || docName.includes('nota de debito');
        const isInvoice = docName.includes('factura') || isCreditNote || isDebitNote;
        const isHonorarium = docName.includes('boleta') && docName.includes('honorario');

        if (isInvoice) {
            taxValue = Math.round(adjustedNetValue * 0.19);
        } else if (isHonorarium) {
            // Honorarium Logic (2026: 15.25%)
            const rate = 0.1525;
            taxValue = Math.round(adjustedNetValue * (rate / (1 - rate)));
        }

        // Nota de Crédito reverses the transaction sign
        if (isCreditNote) {
            signMultiplier = -1;
        }
    }

    const finalNetValue = adjustedNetValue * signMultiplier;
    const finalTaxValue = taxValue * signMultiplier;
    const totalValue = finalNetValue + finalTaxValue;

    await db.update(tasks)
        .set({
            ...rest,
            movementId,
            documentId,
            netValue: finalNetValue,
            taxValue: finalTaxValue,
            totalValue,
            observations,
            lastActionAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        })
        .where(eq(tasks.id, id));

    // Update parent project last action
    await db.update(projects)
        .set({ lastActionAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
        .where(eq(projects.id, rest.projectId));

    revalidatePath(`/projects/${rest.projectId}`);
    revalidatePath('/');
    return { success: true };
}

export async function deleteTask(id: number, projectId: number) {
    if (!await hasPermission(PERMISSIONS.MANAGE_TASKS)) {
        return { success: false, message: 'No tienes permiso para eliminar tareas' };
    }

    await db.delete(tasks).where(eq(tasks.id, id));

    // Update parent project last action
    await db.update(projects)
        .set({ lastActionAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
        .where(eq(projects.id, projectId));

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/');
    return { success: true };
}

export async function registerTaskPayment(taskId: number, paymentDate: string) {
    if (!await hasPermission(PERMISSIONS.MANAGE_TASKS)) {
        return { success: false, message: 'No tienes permiso para actualizar tareas' };
    }

    const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
    if (!task) {
        return { success: false, message: 'La tarea no existe' };
    }

    await db.update(tasks)
        .set({
            paymentDate: paymentDate,
            status: 'Completado',
            lastActionAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
        })
        .where(eq(tasks.id, taskId));

    // Update parent project last action
    await db.update(projects)
        .set({ lastActionAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
        .where(eq(projects.id, task.projectId));

    revalidatePath(`/projects/${task.projectId}`);
    revalidatePath('/reports/pending-payments');
    revalidatePath('/');
    return { success: true };
}
