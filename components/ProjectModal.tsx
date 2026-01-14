"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createProject, updateProject } from '@/lib/project-actions';
import { X } from 'lucide-react';

export default function ProjectModal({
    project,
    employees,
    onClose
}: {
    project?: any,
    employees: any[],
    onClose: () => void
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 sm:p-6" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-[#1e293b] w-full max-w-4xl max-h-[90vh] flex flex-col relative rounded-2xl border border-sky-500/20 shadow-2xl shadow-sky-500/10 animate-in fade-in zoom-in duration-200 overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-[100] p-2 hover:bg-white/5 rounded-full"
                >
                    <X size={24} />
                </button>

                <div className="p-8 pb-4 border-b border-white/5 shrink-0">
                    <h3 className="text-2xl font-bold text-white">
                        {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Ingresa los datos del proyecto</p>
                </div>

                <form action={async (formData) => {
                    const data = {
                        name: formData.get('name'),
                        description: formData.get('description'),
                        ownerId: parseInt(formData.get('ownerId') as string),
                        category: formData.get('category'),
                        status: formData.get('status'),
                        priority: formData.get('priority'),
                        startDate: formData.get('startDate'),
                        endDate: formData.get('endDate'),
                        expectedIncome: parseFloat(formData.get('expectedIncome') as string) || 0,
                        expectedUtility: parseFloat(formData.get('expectedUtility') as string) || 0,
                        budgetDays: parseFloat(formData.get('budgetDays') as string) || 0,
                        notes: formData.get('notes'),
                        observations: formData.get('observations'),
                    };

                    if (project?.id) {
                        await updateProject(project.id, data);
                    } else {
                        await createProject(data);
                    }
                    onClose();
                }} className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
                    <div className="p-8 pt-6 space-y-8 flex-1">
                        {/* Sección: Información Básica */}
                        <div className="space-y-4">
                            <h4 className="text-sky-400 text-xs font-bold uppercase tracking-widest border-b border-sky-500/20 pb-2">Información Básica</h4>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Nombre del Proyecto *</label>
                                <input
                                    name="name"
                                    required
                                    defaultValue={project?.name}
                                    autoFocus={!project}
                                    onFocus={(e) => e.target.select()}
                                    placeholder="Ej: Desarrollo Web Cliente XYZ"
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Descripción</label>
                                <textarea
                                    name="description"
                                    defaultValue={project?.description}
                                    onFocus={(e) => e.target.select()}
                                    placeholder="Descripción breve del proyecto..."
                                    rows={3}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Propietario / Responsable *</label>
                                    <select
                                        name="ownerId"
                                        required
                                        defaultValue={project?.ownerId}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                                    >
                                        {employees.map(e => <option key={e.id} value={e.id} className="bg-slate-900">{e.firstName} {e.lastName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Categoría</label>
                                    <input
                                        name="category"
                                        defaultValue={project?.category}
                                        onFocus={(e) => e.target.select()}
                                        placeholder="Ej: Desarrollo, Consultoría"
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sección: Estado y Prioridad */}
                        <div className="space-y-4">
                            <h4 className="text-sky-400 text-xs font-bold uppercase tracking-widest border-b border-sky-500/20 pb-2">Estado y Prioridad</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Estado</label>
                                    <select
                                        name="status"
                                        defaultValue={project?.status || 'En curso'}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                                    >
                                        <option value="En curso">En curso</option>
                                        <option value="Completado">Completado</option>
                                        <option value="Retrasado">Retrasado</option>
                                        <option value="Pendiente">Pendiente</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Prioridad</label>
                                    <select
                                        name="priority"
                                        defaultValue={project?.priority || '(2) Normal'}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                                    >
                                        <option value="(1) Alta">(1) Alta</option>
                                        <option value="(2) Normal">(2) Normal</option>
                                        <option value="(3) Baja">(3) Baja</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Sección: Fechas */}
                        <div className="space-y-4">
                            <h4 className="text-sky-400 text-xs font-bold uppercase tracking-widest border-b border-sky-500/20 pb-2">Fechas</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Fecha de Inicio</label>
                                    <input
                                        name="startDate"
                                        type="date"
                                        defaultValue={project?.startDate}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Fecha de Término</label>
                                    <input
                                        name="endDate"
                                        type="date"
                                        defaultValue={project?.endDate}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sección: Presupuesto */}
                        <div className="space-y-4">
                            <h4 className="text-sky-400 text-xs font-bold uppercase tracking-widest border-b border-sky-500/20 pb-2">Presupuesto</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Ingreso Esperado (CLP)</label>
                                    <input
                                        name="expectedIncome"
                                        type="number"
                                        step="0.01"
                                        defaultValue={project?.expectedIncome || "0"}
                                        onFocus={(e) => (e.target as HTMLInputElement).select()}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Utilidad Esperada (CLP)</label>
                                    <input
                                        name="expectedUtility"
                                        type="number"
                                        step="0.01"
                                        defaultValue={project?.expectedUtility || "0"}
                                        onFocus={(e) => (e.target as HTMLInputElement).select()}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Días Presupuestados</label>
                                    <input
                                        name="budgetDays"
                                        type="number"
                                        step="0.1"
                                        defaultValue={project?.budgetDays || "0"}
                                        onFocus={(e) => (e.target as HTMLInputElement).select()}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sección: Notas y Observaciones */}
                        <div className="space-y-4">
                            <h4 className="text-sky-400 text-xs font-bold uppercase tracking-widest border-b border-sky-500/20 pb-2">Notas y Observaciones</h4>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Notas</label>
                                <textarea
                                    name="notes"
                                    defaultValue={project?.notes}
                                    onFocus={(e) => e.target.select()}
                                    placeholder="Notas generales del proyecto..."
                                    rows={2}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Observaciones / Datos a recordar</label>
                                <textarea
                                    name="observations"
                                    defaultValue={project?.observations}
                                    onFocus={(e) => e.target.select()}
                                    placeholder="Añade aquí cualquier detalle importante para el seguimiento del proyecto..."
                                    rows={3}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all resize-none"
                                />
                            </div>
                        </div>

                        {project?.lastActionAt && (
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                <span className="w-2 h-2 rounded-full bg-slate-500/30"></span>
                                Última acción: {project.lastActionAt}
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-white/5 bg-slate-900/50 flex gap-4 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[1.5] px-4 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-lg shadow-sky-500/20 transition-all text-lg"
                        >
                            {project ? 'Guardar Cambios' : 'Crear Proyecto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
