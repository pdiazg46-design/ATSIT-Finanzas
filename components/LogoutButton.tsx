'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

export default function LogoutButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        // Force full page reload on logout to clear all state
        await signOut({ callbackUrl: '/login', redirect: true });
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2 rounded-lg transition-colors disabled:opacity-50"
        >
            {isLoading ? (
                <span className="animate-spin h-3.5 w-3.5 border-2 border-rose-400 border-t-transparent rounded-full" />
            ) : (
                <LogOut size={14} />
            )}
            {isLoading ? 'Cerrando...' : 'Cerrar Sesión'}
        </button>
    );
}
