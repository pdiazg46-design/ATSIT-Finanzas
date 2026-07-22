'use client';

import { useFormState } from 'react-dom';
import { authenticate } from '@/lib/actions';
import { ArrowRight, Key, AtSign, CircleAlert, Eye, EyeOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function LoginForm() {
    const [errorMessage, formAction, isPending] = useFormState(
        authenticate,
        undefined
    );
    const [showPassword, setShowPassword] = useState(false);
    const [isPolicyOpen, setIsPolicyOpen] = useState(false);

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <label
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400"
                    htmlFor="email"
                >
                    Usuario / Correo
                </label>
                <div className="relative">
                    <input
                        className="peer block w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                        id="email"
                        type="text"
                        name="email"
                        placeholder="Ej: Patricio o correo@ejemplo.com"
                        required
                        autoComplete="off"
                    />
                    <AtSign className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 peer-focus:text-indigo-400 transition-colors" />
                </div>
            </div>
            <div>
                <label
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400"
                    htmlFor="password"
                >
                    Contraseña
                </label>
                <div className="relative">
                    <input
                        className="peer block w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Ingresa tu contraseña"
                        required
                        minLength={4}
                        autoComplete="off"
                    />
                    <Key className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 peer-focus:text-indigo-400 transition-colors" />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
                        title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>
            <button
                className="mt-6 w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 py-3 text-white hover:from-indigo-500 hover:to-sky-500 transition-all font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none gap-2"
                disabled={isPending}
            >
                {isPending ? 'Ingresando...' : 'Ingresar'}
                <ArrowRight className="h-5 w-5 text-indigo-100" />
            </button>
            <div
                className="flex min-h-8 items-center justify-center space-x-1"
                aria-live="polite"
                aria-atomic="true"
            >
                {errorMessage && (
                    <>
                        <CircleAlert className="h-5 w-5 text-rose-500" />
                        <p className="text-sm text-rose-400">{errorMessage}</p>
                    </>
                )}
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-white/5" />

            {/* Footer Links (Privacy & Contact) */}
            <div className="text-center space-y-3 text-[11px] text-slate-500">
                <div className="flex justify-center items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsPolicyOpen(true)}
                        className="text-slate-400 hover:text-indigo-400 transition-colors hover:underline focus:outline-none"
                    >
                        Política de Privacidad y Responsabilidad
                    </button>
                </div>
                <p>
                    ¿Necesitas una versión web o mejoras?{' '}
                    <a
                        href="https://www.atsit.cl/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
                    >
                        Contáctanos en atsit.cl
                    </a>
                </p>
            </div>

            {/* Privacy Policy Modal */}
            {isPolicyOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <h2 className="text-lg font-bold text-white mb-4">
                            Política de Privacidad y Responsabilidad Local
                        </h2>
                        <div className="space-y-3 text-xs text-slate-400 leading-relaxed max-h-[300px] overflow-y-auto pr-2">
                            <p>
                                <strong>1. Almacenamiento 100% Local:</strong> Todos los datos de finanzas, proyectos, empleados y credenciales ingresados se guardan localmente en la base de datos de este equipo. No transmitimos, recopilamos ni compartimos su información con ningún servidor externo.
                            </p>
                            <p>
                                <strong>2. Límite de Responsabilidad:</strong> El desarrollador del software queda eximido de cualquier responsabilidad derivada de pérdidas financieras, inconsistencias de datos, errores en cálculos impositivos o mal uso de la herramienta. El usuario es el único responsable de validar sus estados financieros.
                            </p>
                            <p>
                                <strong>3. Copias de Seguridad:</strong> Es responsabilidad exclusiva del usuario realizar copias de seguridad de sus archivos de datos localmente para prevenir la pérdida de información en caso de fallos del hardware.
                            </p>
                            <p>
                                <strong>4. Independencia de Vínculo:</strong> Una vez entregado e instalado el software, el desarrollador no mantiene ningún vínculo operativo ni de auditoría con la entidad o persona que lo utiliza.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPolicyOpen(false)}
                            className="mt-6 w-full py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors text-xs"
                        >
                            Entendido y Aceptar
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}
