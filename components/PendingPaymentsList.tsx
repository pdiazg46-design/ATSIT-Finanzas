'use client';

import { useState } from 'react';
import { Calendar, Check, ArrowLeft, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { registerTaskPayment } from '@/lib/task-actions';
import { useRouter } from 'next/navigation';

interface PendingTask {
    id: number;
    title: string;
    projectName: string | null;
    movementName: string | null;
    movementType: string | null;
    documentName: string | null;
    docNumber: string | null;
    netValue: number | null;
    totalValue: number | null;
    dueDate: string | null;
    startDate: string | null;
}

export default function PendingPaymentsList({
    initialTasks
}: {
    initialTasks: PendingTask[]
}) {
    const router = useRouter();
    const [tasksList, setTasksList] = useState<PendingTask[]>(initialTasks);
    const [paymentDates, setPaymentDates] = useState<Record<number, string>>({});
    const [processingIds, setProcessingIds] = useState<Record<number, boolean>>({});

    const handleDateChange = (taskId: number, dateStr: string) => {
        setPaymentDates(prev => ({ ...prev, [taskId]: dateStr }));
    };

    const handleConfirmPayment = async (taskId: number) => {
        const selectedDate = paymentDates[taskId];
        if (!selectedDate) {
            alert('Por favor selecciona una fecha de pago real.');
            return;
        }
        if (processingIds[taskId]) return;

        setProcessingIds(prev => ({ ...prev, [taskId]: true }));

        try {
            const res = await registerTaskPayment(taskId, selectedDate);
            if (res && res.success) {
                // Quitar de la lista local
                setTasksList(prev => prev.filter(t => t.id !== taskId));
                router.refresh();
            } else {
                alert(res?.message || 'No se pudo guardar el pago.');
            }
        } catch (e) {
            console.error(e);
            alert('Error al registrar el pago.');
        } finally {
            setProcessingIds(prev => ({ ...prev, [taskId]: false }));
        }
    };

    const formatCurrency = (val: number | null) => {
        if (val === null || val === undefined) return '$0';
        return '$' + Math.round(val).toLocaleString('es-CL');
    };

    const formatDateStr = (dateStr: string | null) => {
        if (!dateStr) return 'Sin fecha';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <Link href="/reports" className="text-sky-400 hover:text-sky-300 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider mb-2 transition-colors">
                        <ArrowLeft size={16} />
                        Volver a Informes
                    </Link>
                    <h2 className="text-3xl font-bold text-white">Cobros y Pagos Pendientes</h2>
                    <p className="text-slate-400">Registra de forma directa la fecha real de cobro/pago de tus flujos pendientes.</p>
                </div>
            </header>

            <div className="glass-card p-0 overflow-hidden relative animate-in fade-in duration-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                <th className="py-4 px-6">Concepto / Proyecto</th>
                                <th className="py-4 px-6 text-center">Tipo</th>
                                <th className="py-4 px-6">Documento</th>
                                <th className="py-4 px-6 text-right">Vencimiento (Esperado)</th>
                                <th className="py-4 px-6 text-right">Monto Total (Con IVA)</th>
                                <th className="py-4 px-6 text-center">Fecha Real de Pago</th>
                                <th className="py-4 px-6 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tasksList.length > 0 ? (
                                tasksList.map((t) => {
                                    const isGasto = t.movementType === 'Gasto';

                                    return (
                                        <tr key={t.id} className="hover:bg-slate-900/40 transition-colors group">
                                            {/* Concepto / Proyecto */}
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-white text-sm group-hover:text-sky-400 transition-colors">{t.title}</div>
                                                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">{t.projectName || 'Sin Proyecto'}</div>
                                            </td>

                                            {/* Tipo de Movimiento */}
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    isGasto
                                                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                }`}>
                                                    {isGasto ? <ArrowDownRight size={10} /> : <ArrowUpRight size={10} />}
                                                    {t.movementName || 'Otros Gastos'}
                                                </span>
                                            </td>

                                            {/* Documento */}
                                            <td className="py-4 px-6 text-sm text-slate-300 font-medium">
                                                {t.documentName ? (
                                                    <>
                                                        <div>{t.documentName}</div>
                                                        {t.docNumber && (
                                                            <div className="text-xs text-slate-500 mt-0.5">N° {t.docNumber}</div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-slate-500 italic">S/D</span>
                                                )}
                                            </td>

                                            {/* Vencimiento */}
                                            <td className="py-4 px-6 text-right text-sm text-slate-300 font-bold">
                                                {formatDateStr(t.dueDate)}
                                            </td>

                                            {/* Monto Total */}
                                            <td className="py-4 px-6 text-right text-sm font-black text-white">
                                                {formatCurrency(t.totalValue)}
                                            </td>

                                            {/* Input Fecha Pago */}
                                            <td className="py-4 px-6 text-center">
                                                <div className="relative group inline-block">
                                                    <div className={`bg-slate-900 border rounded-lg px-3 py-2 text-xs flex items-center gap-2 cursor-pointer transition-all ${
                                                        paymentDates[t.id] 
                                                            ? 'border-emerald-500/30 text-white hover:bg-slate-800' 
                                                            : 'border-white/10 text-slate-400 hover:border-white/20'
                                                    }`}>
                                                        <Calendar size={14} className={paymentDates[t.id] ? 'text-emerald-400' : 'text-slate-500'} />
                                                        <span className="font-bold">
                                                            {paymentDates[t.id]
                                                                ? paymentDates[t.id].split('-').reverse().join('/')
                                                                : 'Seleccionar...'}
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="date"
                                                        value={paymentDates[t.id] || ''}
                                                        onChange={(e) => handleDateChange(t.id, e.target.value)}
                                                        onClick={(e) => e.currentTarget.showPicker()}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                            </td>

                                            {/* Acción Confirmar */}
                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    onClick={() => handleConfirmPayment(t.id)}
                                                    disabled={processingIds[t.id]}
                                                    className="inline-flex items-center justify-center p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-lg disabled:opacity-40 transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                                                    title="Confirmar Pago y Completar"
                                                >
                                                    {processingIds[t.id] ? (
                                                        <RefreshCw size={14} className="animate-spin" />
                                                    ) : (
                                                        <Check size={14} />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 px-6 text-center text-slate-500 italic text-sm">
                                        ¡Fantástico! No hay cobros o pagos pendientes registrados en el sistema.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
