'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

// Logout function
export async function logout() {
    try {
        // Attempt clean signout
        await signOut({ redirect: false });
    } catch (err) {
        console.error("SignOut Failed", err);
    } finally {
        // Force redirect to login page
        redirect('/login');
    }
}

// Authentication function
export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    // PROBE: Check DB connection explicitly before Auth
    try {
        const { db } = await import('@/lib/db');
        const { users } = await import('@/lib/schema');
        const { count } = await import('drizzle-orm');
        await db.select({ count: count() }).from(users).get();
    } catch (dbError) {
        console.error('DB PROBE ERROR:', dbError);
        return 'ERROR DE CONEXIÓN DB: ' + (dbError instanceof Error ? dbError.message : String(dbError));
    }

    try {
        await signIn('credentials', formData);
    } catch (error) {
        // SUCCESS: NEXT_REDIRECT means strict logic worked and it's redirecting to dashboard
        if ((error as Error).message === 'NEXT_REDIRECT' || (error as Error).message.includes('NEXT_REDIRECT')) {
            throw error;
        }

        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Credenciales inválidas.';
                case 'CallbackRouteError':
                    return `Error de ruta: ${(error as any).cause?.message || error.message}`;
                default:
                    return error.message; // Expose full error for debugging
            }
        }
        return `Error del servidor: ${(error as any).message}`;
    }
}

// Server Action to register initial system administrator
export async function registerInitialAdmin(formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!name || !email || !password) {
            return { error: 'Todos los campos son obligatorios.' };
        }

        const { db } = await import('@/lib/db');
        const { users } = await import('@/lib/schema');
        
        // 1. Verify if database already has users
        const existingUsers = await db.select().from(users).all();
        if (existingUsers.length > 0) {
            return { error: 'El sistema ya se encuentra inicializado.' };
        }

        // 2. Hash password
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.default.hash(password, 10);

        // 3. Admin permissions
        const adminPermissions = JSON.stringify(['ADMIN', 'MANAGE_PROJECTS', 'MANAGE_TASKS', 'MANAGE_EMPLOYEES']);

        // 4. Create admin user
        await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            permissions: adminPermissions
        }).run();

        return { success: true };
    } catch (e) {
        console.error("Failed to register initial admin:", e);
        return { error: 'Error del servidor: ' + (e instanceof Error ? e.message : String(e)) };
    }
}
