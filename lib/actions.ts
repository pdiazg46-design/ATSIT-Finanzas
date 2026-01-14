'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

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
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Credenciales inválidas.';
                case 'CallbackRouteError':
                    const cause = (error as any).cause;
                    return `Error en Callback: ${cause?.message || error.message}`;
                default:
                    return 'Error de Auth: ' + error.message;
            }
        }
        // Expose the real error for debugging
        return 'Error del servidor: ' + (error instanceof Error ? error.message : String(error));
    }
}
