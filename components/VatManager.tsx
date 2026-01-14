'use client';

import { useState } from 'react';
import VatPaymentForm from './VatPaymentForm';
import { Pencil, Trash2, Wallet } from 'lucide-react';
import { deleteVatPayment } from '@/lib/vat-actions';

interface VatPayment {
    id: number;
    paymentDate: string;
    amount: number;
    notes: string | null;
}

export default function VatManager({ payments }: { payments: VatPayment[] }) {
    const [editingPayment, setEditingPayment] = useState<VatPayment | null>(null);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de eliminar este pago?')) {
            await deleteVatPayment(id);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario */}
            <div className="glass-card p-6 h-fit border-sky-500/10">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-xl font-bold text-white">
                        {editingPayment ? 'Editar Pago' : 'Nuevo Pago'}
                    </h3>
                    {editingPayment && (
                        <button
                            onClick={() => setEditingPayment(null)}
                            className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-white/5 rounded transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
                <VatPaymentForm
                    editingPayment={editingPayment}
                    onSuccess={() => setEditingPayment(null)}
                />
            </div>

            {/* Lista de Pagos */}
            <div className="lg:col-span-2 glass-card p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/2 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Historial de Pagos</h3>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        Total Registros: {payments.length}
                    </span>
                </div>
                <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 z-10">
                            <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 bg-slate-900/90 backdrop-blur-sm">
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Monto</th>
                                <th className="px-6 py-4">Observaciones</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <Wallet size={48} className="text-slate-700 mb-4" />
                                            <p className="font-medium">No hay pagos registrados aún.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                payments.map((p) => (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 text-white font-medium whitespace-nowrap">{p.paymentDate}</td>
                                        <td className="px-6 py-4 text-emerald-400 font-bold whitespace-nowrap">{formatCurrency(p.amount)}</td>
                                        <td className="px-6 py-4 text-slate-400 text-sm max-w-[200px] truncate">{p.notes || '-'}</td>
                                        <td className="px-6 py-4 flex justify-center gap-2">
                                            <button
                                                onClick={() => setEditingPayment(p)}
                                                className="p-2 text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
