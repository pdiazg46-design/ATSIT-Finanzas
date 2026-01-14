'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/lib/actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2 rounded-lg transition-colors disabled:opacity-50"
        >
            {pending ? (
                <span className="animate-spin h-3.5 w-3.5 border-2 border-rose-400 border-t-transparent rounded-full" />
            ) : (
                <LogOut size={14} />
            )}
            {pending ? 'Cerrando...' : 'Cerrar Sesión'}
        </button>
    );
}

export default function LogoutButton() {
    return (
        <form action={logout}>
            <SubmitButton />
        </form>
    );
}
