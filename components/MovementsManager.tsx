'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Tag, Check, X, AlertCircle } from 'lucide-react';
import { createMovementAction, updateMovementAction, deleteMovementAction } from '@/lib/catalog-actions';

interface Movement {
    id: number;
    name: string;
    type: 'Ingreso' | 'Gasto';
}

export default function MovementsManager({ initialMovements }: { initialMovements: Movement[] }) {
    const [movements, setMovements] = useState<Movement[]>(initialMovements);
    const [filterType, setFilterType] = useState<'ALL' | 'Ingreso' | 'Gasto'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Form modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMov, setEditingMov] = useState<Movement | null>(null);

    const [nameInput, setNameInput] = useState('');
    const [typeInput, setTypeInput] = useState<'Ingreso' | 'Gasto'>('Gasto');

    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Delete confirm modal state
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const filtered = movements.filter(m => {
        const matchesType = filterType === 'ALL' || m.type === filterType;
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    const openAdd = () => {
        setEditingMov(null);
        setNameInput('');
        setTypeInput('Gasto');
        setMessage(null);
        setShowAddModal(true);
    };

    const openEdit = (mov: Movement) => {
        setEditingMov(mov);
        setNameInput(mov.name);
        setTypeInput(mov.type);
        setMessage(null);
        setShowAddModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('name', nameInput);
        formData.append('type', typeInput);

        if (editingMov) {
            const res = await updateMovementAction(editingMov.id, formData);
            if (res.success) {
                setMovements(prev => prev.map(m => m.id === editingMov.id ? { ...m, name: nameInput, type: typeInput } : m));
                setMessage({ type: 'success', text: res.message });
                setTimeout(() => setShowAddModal(false), 1000);
            } else {
                setMessage({ type: 'error', text: res.message });
            }
        } else {
            const res = await createMovementAction(formData);
            if (res.success && res.movement) {
                const newMov: Movement = {
                    id: res.movement.id,
                    name: res.movement.name,
                    type: (res.movement.type as 'Ingreso' | 'Gasto') || typeInput
                };
                setMovements(prev => [...prev, newMov]);
                setMessage({ type: 'success', text: res.message });
                setTimeout(() => setShowAddModal(false), 1000);
            } else {
                setMessage({ type: 'error', text: res.message });
            }
        }
        setIsPending(false);
    };

    const handleDelete = async (id: number) => {
        setIsPending(true);
        setMessage(null);
        const res = await deleteMovementAction(id);
        if (res.success) {
            setMovements(prev => prev.filter(m => m.id !== id));
            setDeletingId(null);
        } else {
            alert(res.message);
        }
        setIsPending(false);
    };

    return (
        <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Tag className="text-indigo-400" size={22} />
                        Tipos de Movimientos (Categorías)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Define y gestiona los conceptos de Ingresos y Gastos disponibles para tu empresa
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                    <Plus size={16} />
                    Nuevo Tipo de Movimiento
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
                    <button
                        onClick={() => setFilterType('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'ALL' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                        Todos ({movements.length})
                    </button>
                    <button
                        onClick={() => setFilterType('Ingreso')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${filterType === 'Ingreso' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-emerald-400'}`}
                    >
                        <ArrowUpRight size={14} />
                        Ingresos ({movements.filter(m => m.type === 'Ingreso').length})
                    </button>
                    <button
                        onClick={() => setFilterType('Gasto')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${filterType === 'Gasto' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-rose-400'}`}
                    >
                        <ArrowDownRight size={14} />
                        Gastos ({movements.filter(m => m.type === 'Gasto').length})
                    </button>
                </div>

                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar tipo de movimiento..."
                    className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
            </div>

            {/* List Table */}
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/40">
                <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/5 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/5">
                        <tr>
                            <th className="p-3.5">Nombre del Movimiento</th>
                            <th className="p-3.5">Tipo</th>
                            <th className="p-3.5 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-6 text-center text-slate-500">
                                    No se encontraron tipos de movimiento registrados.
                                </td>
                            </tr>
                        ) : (
                            filtered.map(mov => (
                                <tr key={mov.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-3.5 font-medium text-white">
                                        {mov.name}
                                    </td>
                                    <td className="p-3.5">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${mov.type === 'Ingreso' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                            {mov.type === 'Ingreso' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                            {mov.type}
                                        </span>
                                    </td>
                                    <td className="p-3.5 text-right space-x-2">
                                        <button
                                            onClick={() => openEdit(mov)}
                                            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(mov.id)}
                                            className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add / Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-white/10 bg-slate-900 shadow-2xl relative">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X size={18} />
                        </button>

                        <h3 className="text-lg font-bold text-white mb-4">
                            {editingMov ? 'Editar Tipo de Movimiento' : 'Crear Tipo de Movimiento'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Nombre del Concepto
                                </label>
                                <input
                                    type="text"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    placeholder="Ej: Publicidad y Marketing, Venta de Equipos..."
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Clasificación
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTypeInput('Ingreso')}
                                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${typeInput === 'Ingreso' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                                    >
                                        <ArrowUpRight size={14} />
                                        INGRESO ↗
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTypeInput('Gasto')}
                                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${typeInput === 'Gasto' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/10' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                                    >
                                        <ArrowDownRight size={14} />
                                        GASTO ↘
                                    </button>
                                </div>
                            </div>

                            {message && (
                                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                    {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                    <span>{message.text}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                            >
                                {isPending ? 'Guardando...' : editingMov ? 'Guardar Cambios' : 'Crear Tipo de Movimiento'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass-card max-w-sm w-full p-6 rounded-2xl border border-rose-500/30 bg-slate-900 shadow-2xl text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-white">¿Confirmas la eliminación?</h4>
                            <p className="text-xs text-slate-400 mt-1">
                                Esta acción eliminará el tipo de movimiento seleccionado si no tiene registros asociados.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(deletingId)}
                                disabled={isPending}
                                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                            >
                                {isPending ? 'Eliminando...' : 'Sí, Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
