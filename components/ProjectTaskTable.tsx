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
    documents,
    canManageTasks
}: {
    tasks: any[],
    projectId: number,
    employees: any[],
    movements: any[],
    documents: any[],
    canManageTasks?: boolean
}) {
    const [editingTask, setEditingTask] = useState<any>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Default to false if undefined
    const canManage = canManageTasks === true;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    return (
        <>
            {/* Botón Flotante/Header para Añadir */}
            {canManage && (
                <div className="absolute top-6 right-6 flex gap-3">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                    >
                        Agregar Tarea
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="hidden md:table-header-group">
                        <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/5">
                            <th className="px-6 py-4">Título</th>
                            <th className="px-6 py-4">Asignado a</th>
                            <th className="px-6 py-4">Movimiento</th>
                            <th className="px-6 py-4">Documento</th>
                            <th className="px-6 py-4 text-right">Valor Neto</th>
                            <th className="px-6 py-4 text-center">Impuesto</th>
                            <th className="px-6 py-4 text-right">Total</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-center">Fecha Doc.</th>
                            {canManage && <th className="px-6 py-4 text-right">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 block md:table-row-group">
                        {tasks.map((t) => (
                            <tr key={t.id} className="hover:bg-white/5 transition-colors group flex flex-col md:table-row border-b md:border-b-0 border-white/5 p-4 md:p-0 relative">
                                <td className="px-2 md:px-6 py-2 md:py-4 text-sm text-white font-medium flex justify-between md:table-cell items-center">
                                    <span className="md:hidden text-xs text-slate-500 uppercase font-bold">Título</span>
                                    {t.title}
                                </td>
                                <td className="px-2 md:px-6 py-1 md:py-4 text-sm text-slate-400 flex justify-between md:table-cell items-center">
                                    <span className="md:hidden text-xs text-slate-500 uppercase font-bold">Asignado</span>
                                    {t.assignedTo}
                                </td>
                                <td className="px-2 md:px-6 py-1 md:py-4 text-sm text-slate-400 flex justify-between md:table-cell items-center">
                                    <span className="md:hidden text-xs text-slate-500 uppercase font-bold">Movimiento</span>
                                    {t.movement}
                                </td>
                                <td className="px-2 md:px-6 py-1 md:py-4 text-sm text-slate-400 flex justify-between md:table-cell items-center">
                                    <span className="md:hidden text-xs text-slate-500 uppercase font-bold">Documento</span>
                                    <span>{t.document} <span className="text-xs text-slate-600 italic">#{t.docNumber}</span></span>
                                </td>
                                <td className={`px-2 md:px-6 py-1 md:py-4 text-sm md:text-right font-bold flex justify-between md:table-cell items-center ${(t.netValue || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    <span className="md:hidden text-xs text-slate-500 uppercase font-bold">Neto</span>
                                    {formatCurrency(t.netValue || 0)}
                                </td>
                                <td className="px-2 md:px-6 py-1 md:py-4 text-sm md:text-center text-slate-500 flex justify-between md:table-cell items-center">
                                    <span className="md:hidden text-xs text-slate-500 uppercase font-bold">
                                        {t.documentId === 44 ? 'Retención' : 'IVA'}
                                    </span>
                                    {t.taxValue ? (
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-bold text-slate-600">
                                                {t.documentId === 44 ? 'Ret:' : 'IVA:'}
                                            </span>
                                            {formatCurrency(t.taxValue)}
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className={`px-2 md:px-6 py-1 md:py-4 text-sm md:text-right font-bold flex justify-between md:table-cell items-center ${(t.totalValue || 0) >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
                                    <span className="md:hidden text-xs text-slate-500 uppercase font-bold">Total</span>
                                    {formatCurrency(t.totalValue || 0)}
                                </td>
                                <td className="px-2 md:px-6 py-1 md:py-4 flex justify-between md:table-cell items-center">
                                    <span className="md:hidden text-xs text-slate-500 uppercase font-bold">Estado</span>
                                    <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold ${t.status === 'Completado' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'}`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-2 md:px-6 py-1 md:py-4 text-center text-xs text-slate-500 flex justify-between md:table-cell items-center">
                                    <span className="md:hidden text-slate-500 uppercase font-bold">Fecha</span>
                                    {t.startDate ? t.startDate.split('-').reverse().join('-') : '-'}
                                </td>
                                {canManage && (
                                    <td className="px-2 md:px-6 py-4 md:py-4 text-right flex justify-end gap-2 md:table-cell mt-2 md:mt-0 pt-4 md:pt-4 border-t md:border-t-0 border-white/5">
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
                                )}
                            </tr>
                        ))}
                        {tasks.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-6 py-8 text-center text-slate-500 italic block md:table-cell">No hay tareas registradas para este proyecto.</td>
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
