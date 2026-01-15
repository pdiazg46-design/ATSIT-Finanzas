"use server";

import { db } from '@/lib/db';
import { projects, tasks } from '@/lib/schema';
import { eq, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { hasPermission } from '@/lib/user-actions';
import { PERMISSIONS } from '@/lib/permissions';

export async function createProject(data: any) {
    if (!await hasPermission(PERMISSIONS.MANAGE_PROJECTS)) {
        return { success: false, message: 'No tienes permiso para crear proyectos' };
    }

    await db.insert(projects).values({
        ...data,
        lastActionAt: new Date().toISOString(),
    });

    revalidatePath('/projects');
    revalidatePath('/');
    return { success: true };
}

export async function updateProject(id: number, data: any) {
    if (!await hasPermission(PERMISSIONS.MANAGE_PROJECTS)) {
        return { success: false, message: 'No tienes permiso para editar proyectos' };
    }

    await db.update(projects)
        .set({
            ...data,
            lastActionAt: new Date().toISOString(),
        })
        .where(eq(projects.id, id));

    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    revalidatePath('/');
}

export async function deleteProject(id: number) {
    if (!await hasPermission(PERMISSIONS.MANAGE_PROJECTS)) {
        return { success: false, message: 'No tienes permiso para eliminar proyectos' };
    }

    const taskCountResult = await db.select({ count: count() }).from(tasks).where(eq(tasks.projectId, id)).get();
    const taskCount = taskCountResult?.count || 0;

    if (taskCount > 0) {
        return { success: false, message: "No se puede eliminar un proyecto con tareas asociadas. Elimina las tareas primero." };
    }

    await db.delete(projects).where(eq(projects.id, id));

    revalidatePath('/projects');
    revalidatePath('/');
    revalidatePath('/');
    return { success: true };
}

export async function archiveProject(id: number) {
    if (!await hasPermission(PERMISSIONS.MANAGE_PROJECTS)) {
        return { success: false, message: 'No tienes permiso para archivar proyectos' };
    }

    await db.update(projects)
        .set({ isArchived: true, lastActionAt: new Date().toISOString() })
        .where(eq(projects.id, id));

    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    revalidatePath('/');
    revalidatePath('/history');
}

export async function activateProject(id: number) {
    if (!await hasPermission(PERMISSIONS.MANAGE_PROJECTS)) {
        return { success: false, message: 'No tienes permiso para activar proyectos' };
    }

    await db.update(projects)
        .set({ isArchived: false, lastActionAt: new Date().toISOString() })
        .where(eq(projects.id, id));

    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    revalidatePath('/');
    revalidatePath('/history');
}
