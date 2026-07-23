'use client';

import { useState } from 'react';
import { activateLicenseAction } from '@/lib/actions';
import { ShieldCheck, Key, Lock, AlertTriangle, CheckCircle, X, Copy } from 'lucide-react';

interface LicenseBannerModalProps {
    isExpired: boolean;
    isFull: boolean;
    daysRemaining: number;
    hardwareId?: string;
}

import ZoomControls from '@/components/ZoomControls';

export default function LicenseBannerModal({ isExpired, isFull, daysRemaining, hardwareId }: LicenseBannerModalProps) {
    const [showModal, setShowModal] = useState(isExpired);
    const [key, setKey] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('key', key);
        const res = await activateLicenseAction(formData);

        if (res.success) {
            setMessage({ type: 'success', text: res.message });
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            setMessage({ type: 'error', text: res.message });
        }
        setIsPending(false);
    };

    return (
        <>
            {/* Sticky Top Bar (Never hides on scroll) */}
            <div className="sticky top-0 z-40 bg-slate-900/95 border-b border-amber-500/30 px-4 py-2 flex flex-wrap justify-between items-center text-xs text-amber-200 backdrop-blur-md gap-2 shadow-lg">
                {!isFull && !isExpired ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-mono font-bold tracking-wide shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span>⏳ {daysRemaining} {daysRemaining === 1 ? 'DÍA RESTANTE' : 'DÍAS RESTANTES'}</span>
                        </div>
                        <span className="hidden sm:inline text-slate-300">
                            Modo Evaluación DEMO (15 días de prueba)
                        </span>
                        <div className="hidden md:flex items-center gap-2">
                            <div className="w-24 bg-white/10 rounded-full h-2 overflow-hidden border border-white/5">
                                <div
                                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.max(5, (daysRemaining / 15) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ) : isFull ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <ShieldCheck size={16} />
                        <span>ATSIT Finanzas - Licencia Vitalicia Activa</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                        <Lock size={16} />
                        <span>Modo Evaluación Expirado - Requiere Licencia</span>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {/* Persistent Screen Zoom Controls */}
                    <ZoomControls />

                    {!isFull && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black px-3 py-1.5 rounded-lg transition-all text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 shrink-0"
                        >
                            <Key size={13} />
                            Activar Licencia
                        </button>
                    )}
                </div>
            </div>

            {/* Expired Lock Screen or Activation Modal */}
            {(showModal || isExpired) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="glass-card max-w-md w-full p-6 md:p-8 rounded-2xl border border-amber-500/30 bg-slate-900/90 shadow-2xl relative">
                        {!isExpired && (
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}

                        <div className="text-center mb-6">
                            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg ${isExpired ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                                {isExpired ? <Lock size={28} /> : <ShieldCheck size={28} />}
                            </div>

                            <h3 className="text-2xl font-black text-white">
                                {isExpired ? 'Periodo DEMO Finalizado' : 'Activar Licencia Completa'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                {isExpired ? (
                                    <>Tu prueba gratuita de 15 días ha expirado. Proporciona el <strong>ID de tu equipo</strong> para recibir la clave de activación ilimitada.</>
                                ) : (
                                    <>Ingresa la clave de licencia activada para este equipo para obtener <strong>Acceso Completo de Por Vida</strong>.</>
                                )}
                            </p>
                        </div>

                        {/* Hardware ID Display Box */}
                        {hardwareId && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-5 text-xs">
                                <div className="flex justify-between items-center text-slate-400 mb-1">
                                    <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">ID de este Equipo (HWID / MAC)</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(hardwareId);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 text-[11px]"
                                    >
                                        <Copy size={12} />
                                        {copied ? '¡Copiado!' : 'Copiar ID'}
                                    </button>
                                </div>
                                <div className="font-mono text-amber-300 text-sm font-bold bg-slate-950/70 p-2.5 rounded-lg border border-amber-500/20 tracking-wider text-center select-all">
                                    {hardwareId}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleActivate} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Clave de Licencia / Activación
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={key}
                                        onChange={(e) => setKey(e.target.value)}
                                        placeholder="Ej: KEY-XXXX-XXXX-XXXX-XXXX"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono tracking-wider"
                                    />
                                    <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                </div>
                            </div>

                            {message && (
                                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                    <span>{message.text}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full py-3 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50"
                            >
                                {isPending ? 'Validando...' : 'Desbloquear Licencia de Por Vida'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
