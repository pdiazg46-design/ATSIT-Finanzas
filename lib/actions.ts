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
