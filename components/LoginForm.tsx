'use client';

import { useFormState } from 'react-dom';
import { authenticate } from '@/lib/actions';
import { ArrowRight, Key, AtSign, CircleAlert } from 'lucide-react';

export default function LoginForm() {
    const [errorMessage, formAction, isPending] = useFormState(
        authenticate,
        undefined
    );

    return (
        <form action={formAction} className="space-y-3">
            <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:bg-slate-900 dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <h1 className={`mb-3 text-2xl font-bold text-gray-900 dark:text-white`}>
                    Iniciar Sesión
                </h1>
                <div className="w-full">
                    <div>
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-gray-300"
                            htmlFor="email"
                        >
                            Correo Electrónico
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 text-black"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Ingresa tu correo"
                                required
                            />
                            <AtSign className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-gray-300"
                            htmlFor="password"
                        >
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 text-black"
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Ingresa contraseña"
                                required
                                minLength={6}
                            />
                            <Key className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                        </div>
                    </div>
                </div>
                <button
                    className="mt-4 w-full flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 transition-colors gap-2 font-medium"
                    aria-disabled={isPending}
                >
                    Ingresar <ArrowRight className="ml-auto h-5 w-5 text-gray-50" />
                </button>
                <div
                    className="flex h-8 items-end space-x-1"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {errorMessage && (
                        <>
                            <CircleAlert className="h-5 w-5 text-red-500" />
                            <p className="text-sm text-red-500">{errorMessage}</p>
                        </>
                    )}
                </div>
            </div>
        </form>
    );
}
