"use server";

import { db } from '@/lib/db';
import { tasks, movements, projects, documents } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

export async function createTask(data: any) {
    const { netValue, documentId, movementId, observations, ...rest } = data;

    // Fetch movement type to determine sign
    const movement = await db.select().from(movements).where(eq(movements.id, movementId)).get();
    const type = movement?.type || 'Gasto';

    // Ensure correct sign: positive for Ingreso, negative for Gasto
    const absoluteValue = Math.round(Math.abs(netValue || 0));
    const adjustedNetValue = type === 'Ingreso' ? absoluteValue : -absoluteValue;

    // Verify document type for IVA
    const document = await db.select().from(documents).where(eq(documents.id, documentId)).get();

    let taxValue = 0;
    if (document?.name === 'Factura Electrónica') {
        taxValue = Math.round(adjustedNetValue * 0.19);
    }

    const totalValue = adjustedNetValue + taxValue;

    await db.insert(tasks).values({
        ...rest,
        movementId,
        documentId,
        netValue: adjustedNetValue,
        taxValue,
        totalValue,
        observations,
        lastActionAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    // --- AUTOMATED TRANSFER LOGIC ---
    // Check if movement is 'Ahorro 10%' or 'Gastos Comunes'
    // If so, create a positive entry (Income) in the corresponding project.
    if (movement) {
        const targetProjectName = movement.name; // 'Ahorro 10%' or 'Gastos Comunes'
        if (['Ahorro 10%', 'Gastos Comunes'].includes(targetProjectName)) {
            // Find target project
            const targetProject = await db.select().from(projects).where(eq(projects.name, targetProjectName)).get();

            if (targetProject) {
                // Determine source project name for the description
                const sourceProject = await db.select().from(projects).where(eq(projects.id, rest.projectId)).get();
                const sourceName = sourceProject ? sourceProject.name : 'Proyecto desconocido';

                // Create mirror task (Income)
                // Net Value should be positive (absolute of the expense)
                const transferValue = Math.abs(adjustedNetValue);

                await db.insert(tasks).values({
                    projectId: targetProject.id,
                    title: `Transferencia desde ${sourceName}`,
                    employeeId: rest.employeeId, // Keep same employee or null
                    movementId: movementId,
                    documentId: documentId, // Keep same document or null
                    docNumber: data.docNumber,
                    status: 'Completado', // Auto-complete transfer
                    netValue: transferValue,
                    taxValue: 0, // Transfers usually don't have VAT implications in this context
                    totalValue: transferValue,
                    observations: `Transferencia automática generada por tarea en proyecto origen.`,
                    lastActionAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    startDate: data.startDate || new Date().toISOString().substring(0, 10),
                });
            }
        }
    }
    // ----------------------------

    // Update parent project last action
    await db.update(projects)
        .set({ lastActionAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
        .where(eq(projects.id, rest.projectId));

    revalidatePath(`/projects/${rest.projectId}`);
    revalidatePath('/');
}

export async function updateTask(id: number, data: any) {
    const { netValue, documentId, movementId, observations, ...rest } = data;

    // Fetch movement type to determine sign
    const movement = await db.select().from(movements).where(eq(movements.id, movementId)).get();
    const type = movement?.type || 'Gasto';

    // Ensure correct sign: positive for Ingreso, negative for Gasto
    const absoluteValue = Math.round(Math.abs(netValue || 0));
    const adjustedNetValue = type === 'Ingreso' ? absoluteValue : -absoluteValue;

    // Verify document type for IVA
    const document = await db.select().from(documents).where(eq(documents.id, documentId)).get();

    let taxValue = 0;
    if (document?.name === 'Factura Electrónica') {
        taxValue = Math.round(adjustedNetValue * 0.19);
    }

    const totalValue = adjustedNetValue + taxValue;

    await db.update(tasks)
        .set({
            ...rest,
            movementId,
            documentId,
            netValue: adjustedNetValue,
            taxValue,
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
}

export async function deleteTask(id: number, projectId: number) {
    await db.delete(tasks).where(eq(tasks.id, id));

    // Update parent project last action
    await db.update(projects)
        .set({ lastActionAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
        .where(eq(projects.id, projectId));

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/');
}
