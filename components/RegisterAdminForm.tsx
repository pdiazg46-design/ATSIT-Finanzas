'use client';

import { useState } from 'react';
import { registerInitialAdmin } from '@/lib/actions';
import { ArrowRight, Key, AtSign, User, CircleAlert, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function RegisterAdminForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 4) {
            setError('La contraseña debe tener al menos 4 caracteres.');
            return;
        }

        setIsPending(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);

            const result = await registerInitialAdmin(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setSuccess(true);
                // Reload page after success to transition to login view
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (err) {
            setError('Ocurrió un error inesperado al inicializar la cuenta.');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-xs text-indigo-300 leading-relaxed mb-4">
                <p className="font-bold mb-1">🚀 Inicialización del Sistema</p>
                Esta es la primera vez que arranca **ATSIT Finanzas** en esta máquina. Crea la cuenta del **Administrador Principal** para iniciar.
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="reg-name">
                    Nombre Completo
                </label>
                <div className="relative">
                    <input
                        className="peer block w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                        id="reg-name"
                        type="text"
                        placeholder="Ej: Patricio Díaz"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="off"
                    />
                    <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 peer-focus:text-indigo-400 transition-colors" />
                </div>
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="reg-email">
                    Usuario / Correo
                </label>
                <div className="relative">
                    <input
                        className="peer block w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                        id="reg-email"
                        type="text"
                        placeholder="Ej: pdiaz o correo@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="off"
                    />
                    <AtSign className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 peer-focus:text-indigo-400 transition-colors" />
                </div>
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="reg-password">
                    Nueva Contraseña
                </label>
                <div className="relative">
                    <input
                        className="peer block w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 4 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={4}
                        autoComplete="off"
                    />
                    <Key className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 peer-focus:text-indigo-400 transition-colors" />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="reg-confirm-password">
                    Confirmar Contraseña
                </label>
                <div className="relative">
                    <input
                        className="peer block w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                        id="reg-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Repite la contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={4}
                        autoComplete="off"
                    />
                    <Key className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 peer-focus:text-indigo-400 transition-colors" />
                </div>
            </div>

            <button
                className="mt-6 w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 py-3 text-white hover:from-emerald-500 hover:to-indigo-500 transition-all font-semibold shadow-lg shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none gap-2"
                disabled={isPending || success}
            >
                {isPending ? 'Inicializando...' : success ? '¡Listo!' : 'Registrar Admin e Iniciar'}
                <ArrowRight className="h-5 w-5 text-indigo-100" />
            </button>

            <div className="flex min-h-8 items-center justify-center space-x-1" aria-live="polite">
                {error && (
                    <>
                        <CircleAlert className="h-5 w-5 text-rose-500" />
                        <p className="text-sm text-rose-400">{error}</p>
                    </>
                )}
                {success && (
                    <>
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <p className="text-sm text-emerald-400">¡Admin creado! Cargando panel...</p>
                    </>
                )}
            </div>
        </form>
    );
}
