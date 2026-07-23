'use server';

import { db } from '@/lib/db';
import { movements, documents, tasks } from '@/lib/schema';
import { eq, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { hasPermission } from '@/lib/user-actions';
import { PERMISSIONS } from '@/lib/permissions';

// --- MOVEMENTS ACTIONS ---

export async function getMovements() {
    try {
        return await db.select().from(movements).all();
    } catch (e) {
        console.error('Failed to fetch movements:', e);
        return [];
    }
}

export async function createMovementAction(formData: FormData) {
    if (!await hasPermission(PERMISSIONS.MANAGE_TASKS)) {
        return { success: false, message: 'No tienes permiso para gestionar movimientos' };
    }

    const name = (formData.get('name') as string || '').trim();
    const type = (formData.get('type') as string || 'Gasto') as 'Ingreso' | 'Gasto';

    if (!name) {
        return { success: false, message: 'El nombre del tipo de movimiento es obligatorio' };
    }

    try {
        // Check duplicate
        const existing = await db.select().from(movements).where(eq(movements.name, name)).get();
        if (existing) {
            return { success: false, message: 'Ya existe un tipo de movimiento con ese nombre' };
        }

        const newMov = await db.insert(movements).values({ name, type }).returning().get();
        revalidatePath('/', 'layout');
        return { success: true, movement: newMov, message: 'Tipo de movimiento creado correctamente' };
    } catch (e) {
        console.error('Failed to create movement:', e);
        return { success: false, message: 'Error al crear tipo de movimiento' };
    }
}

export async function updateMovementAction(id: number, formData: FormData) {
    if (!await hasPermission(PERMISSIONS.MANAGE_TASKS)) {
        return { success: false, message: 'No tienes permiso para gestionar movimientos' };
    }

    const name = (formData.get('name') as string || '').trim();
    const type = (formData.get('type') as string || 'Gasto') as 'Ingreso' | 'Gasto';

    if (!name) {
        return { success: false, message: 'El nombre no puede estar vacío' };
    }

    try {
        await db.update(movements).set({ name, type }).where(eq(movements.id, id));
        revalidatePath('/', 'layout');
        return { success: true, message: 'Tipo de movimiento actualizado correctamente' };
    } catch (e) {
        console.error('Failed to update movement:', e);
        return { success: false, message: 'Error al actualizar tipo de movimiento' };
    }
}

export async function deleteMovementAction(id: number) {
    if (!await hasPermission(PERMISSIONS.MANAGE_TASKS)) {
        return { success: false, message: 'No tienes permiso para gestionar movimientos' };
    }

    try {
        // Check if movement is referenced in tasks
        const linkedTasks = await db.select({ count: count() }).from(tasks).where(eq(tasks.movementId, id)).get();
        if (linkedTasks && Number(linkedTasks.count) > 0) {
            return {
                success: false,
                message: `No se puede eliminar porque existen ${linkedTasks.count} registros o transacciones asociadas a este tipo.`
            };
        }

        await db.delete(movements).where(eq(movements.id, id));
        revalidatePath('/', 'layout');
        return { success: true, message: 'Tipo de movimiento eliminado correctamente' };
    } catch (e) {
        console.error('Failed to delete movement:', e);
        return { success: false, message: 'Error al eliminar tipo de movimiento' };
    }
}


// --- DOCUMENTS ACTIONS ---

export async function getDocuments() {
    try {
        return await db.select().from(documents).all();
    } catch (e) {
        console.error('Failed to fetch documents:', e);
        return [];
    }
}

export async function createDocumentAction(formData: FormData) {
    if (!await hasPermission(PERMISSIONS.MANAGE_TASKS)) {
        return { success: false, message: 'No tienes permiso para gestionar documentos' };
    }

    const name = (formData.get('name') as string || '').trim();

    if (!name) {
        return { success: false, message: 'El nombre del documento es obligatorio' };
    }

    try {
        // Check duplicate
        const existing = await db.select().from(documents).where(eq(documents.name, name)).get();
        if (existing) {
            return { success: false, message: 'Ya existe un tipo de documento con ese nombre' };
        }

        const newDoc = await db.insert(documents).values({ name }).returning().get();
        revalidatePath('/', 'layout');
        return { success: true, document: newDoc, message: 'Tipo de documento creado correctamente' };
    } catch (e) {
        console.error('Failed to create document:', e);
        return { success: false, message: 'Error al crear tipo de documento' };
    }
}

export async function updateDocumentAction(id: number, formData: FormData) {
    if (!await hasPermission(PERMISSIONS.MANAGE_TASKS)) {
        return { success: false, message: 'No tienes permiso para gestionar documentos' };
    }

    const name = (formData.get('name') as string || '').trim();

    if (!name) {
        return { success: false, message: 'El nombre no puede estar vacío' };
    }

    try {
        await db.update(documents).set({ name }).where(eq(documents.id, id));
        revalidatePath('/', 'layout');
        return { success: true, message: 'Tipo de documento actualizado correctamente' };
    } catch (e) {
        console.error('Failed to update document:', e);
        return { success: false, message: 'Error al actualizar tipo de documento' };
    }
}

export async function deleteDocumentAction(id: number) {
    if (!await hasPermission(PERMISSIONS.MANAGE_TASKS)) {
        return { success: false, message: 'No tienes permiso para gestionar documentos' };
    }

    try {
        // Check if document is referenced in tasks
        const linkedTasks = await db.select({ count: count() }).from(tasks).where(eq(tasks.documentId, id)).get();
        if (linkedTasks && Number(linkedTasks.count) > 0) {
            return {
                success: false,
                message: `No se puede eliminar porque existen ${linkedTasks.count} registros vinculados a este tipo de documento.`
            };
        }

        await db.delete(documents).where(eq(documents.id, id));
        revalidatePath('/', 'layout');
        return { success: true, message: 'Tipo de documento eliminado correctamente' };
    } catch (e) {
        console.error('Failed to delete document:', e);
        return { success: false, message: 'Error al eliminar tipo de documento' };
    }
}
