'use client';

import { useState } from 'react';
import { FileText, Edit, Trash2 } from 'lucide-react';
import AddTaskModal from './AddTaskModal';
import { deleteTask } from '@/lib/task-actions';

export default function ProjectTaskTable({
    tasks,
    projectId,
    employees,
    movements,
    documents
}: {
    tasks: any[],
    projectId: number,
    employees: any[],
    movements: any[],
    documents: any[]
}) {
    const [editingTask, setEditingTask] = useState<any>(null);
    const [isAdding, setIsAdding] = useState(false);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    return (
        <>
            {/* Botón Flotante/Header para Añadir (Opcional, pero lo pondremos aquí para consistencia) */}
            <div className="absolute top-6 right-6 flex gap-3">
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                >
                    Agregar Tarea
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/5">
                            <th className="px-6 py-4">Título</th>
                            <th className="px-6 py-4">Asignado a</th>
                            <th className="px-6 py-4">Movimiento</th>
                            <th className="px-6 py-4">Documento</th>
                            <th className="px-6 py-4 text-right">Valor Neto</th>
                            {/* Removed VAT Header */}
                            <th className="px-6 py-4 text-center">IVA (19%)</th>
                            <th className="px-6 py-4 text-right">Total</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-center">Fecha Doc.</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {tasks.map((t) => (
                            <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4 text-sm text-white font-medium">{t.title}</td>
                                <td className="px-6 py-4 text-sm text-slate-400">{t.assignedTo}</td>
                                <td className="px-6 py-4 text-sm text-slate-400">{t.movement}</td>
                                <td className="px-6 py-4 text-sm text-slate-400">{t.document} <span className="text-xs text-slate-600 italic">#{t.docNumber}</span></td>
                                <td className={`px-6 py-4 text-sm text-right font-bold ${(t.netValue || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {formatCurrency(t.netValue || 0)}
                                </td>
                                {/* Removed VAT Cell */}
                                <td className="px-6 py-4 text-sm text-center text-slate-500">
                                    {t.taxValue ? formatCurrency(t.taxValue) : '-'}
                                </td>
                                <td className={`px-6 py-4 text-sm text-right font-bold ${(t.totalValue || 0) >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
                                    {formatCurrency(t.totalValue || 0)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold ${t.status === 'Completado' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'
                                        }`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-xs text-slate-500">
                                    {t.startDate ? t.startDate.split('-').reverse().join('-') : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setEditingTask(t)}
                                        className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 rounded-lg transition-all"
                                        title="Editar tarea"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (confirm('¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.')) {
                                                await deleteTask(t.id, projectId);
                                            }
                                        }}
                                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all ml-1"
                                        title="Eliminar tarea"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {tasks.length === 0 && (
                            <tr>
                                <td colSpan={9} className="px-6 py-8 text-center text-slate-500 italic">No hay tareas registradas para este proyecto.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingTask && (
                <AddTaskModal
                    projectId={projectId}
                    employees={employees}
                    movements={movements}
                    documents={documents}
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                />
            )}

            {isAdding && (
                <AddTaskModal
                    projectId={projectId}
                    employees={employees}
                    movements={movements}
                    documents={documents}
                    onClose={() => setIsAdding(false)}
                />
            )}
        </>
    );
}
