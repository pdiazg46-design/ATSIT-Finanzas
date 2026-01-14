'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';

// Define available permissions
export const PERMISSIONS = {
    ADMIN: 'ADMIN',
    MANAGE_PROJECTS: 'MANAGE_PROJECTS',
    MANAGE_TASKS: 'MANAGE_TASKS',
    MANAGE_EMPLOYEES: 'MANAGE_EMPLOYEES',
};

// Check if current user has a specific permission
export async function hasPermission(permission: string) {
    // BUILD-TIME GUARD: If no DB URL, assume no permissions/build mode
    if (!process.env.DATABASE_URL) return false;

    const session = await auth();
    if (!session?.user?.email) return false;

    const user = await db.select().from(users).where(eq(users.email, session.user.email)).get();
    if (!user || !user.permissions) return false;

    try {
        const perms = JSON.parse(user.permissions);
        return perms.includes(PERMISSIONS.ADMIN) || perms.includes(permission);
    } catch {
        return false;
    }
}

export async function getUsers() {
    // BUILD-TIME GUARD
    if (!process.env.DATABASE_URL) return [];

    // Check admin permission first
    if (!await hasPermission(PERMISSIONS.ADMIN)) {
        throw new Error("No tienes permiso para ver usuarios");
    }

    const allUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email, // using email as identifier/username
        permissions: users.permissions
    }).from(users).all();

    return allUsers.map(u => ({
        ...u,
        permissions: u.permissions ? JSON.parse(u.permissions) : []
    }));
}

export async function createUser(formData: FormData) {
    if (!await hasPermission(PERMISSIONS.ADMIN)) return { success: false, message: 'No autorizado' };

    const name = formData.get('name') as string;
    const email = formData.get('email') as string; // Acts as username
    const password = formData.get('password') as string;

    // Extract permissions
    const permissions: string[] = [];
    if (formData.get('perm_projects') === 'on') permissions.push(PERMISSIONS.MANAGE_PROJECTS);
    if (formData.get('perm_tasks') === 'on') permissions.push(PERMISSIONS.MANAGE_TASKS);
    if (formData.get('perm_employees') === 'on') permissions.push(PERMISSIONS.MANAGE_EMPLOYEES);
    if (formData.get('perm_admin') === 'on') permissions.push(PERMISSIONS.ADMIN);

    if (!name || !email || !password) {
        return { success: false, message: 'Faltan datos requeridos' };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            permissions: JSON.stringify(permissions)
        });

        revalidatePath('/settings');
        return { success: true, message: 'Usuario creado exitosamente' };
    } catch (error) {
        console.error("Create User Error:", error);
        return { success: false, message: 'Error al crear usuario. ¿Quizás ya existe?' };
    }
}

export async function deleteUser(userId: number) {
    if (!await hasPermission(PERMISSIONS.ADMIN)) return { success: false, message: 'No autorizado' };

    try {
        // Prevent deleting yourself
        const session = await auth();
        const currentUser = await db.select().from(users).where(eq(users.email, session?.user?.email || '')).get();

        if (currentUser && currentUser.id === userId) {
            return { success: false, message: 'No puedes eliminar tu propia cuenta' };
        }

        await db.delete(users).where(eq(users.id, userId));
        revalidatePath('/settings');
        return { success: true, message: 'Usuario eliminado' };
    } catch (error) {
        return { success: false, message: 'Error al eliminar usuario' };
    }
}
