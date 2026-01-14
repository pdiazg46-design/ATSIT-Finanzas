'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
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
