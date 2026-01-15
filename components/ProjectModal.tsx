"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createProject, updateProject } from '@/lib/project-actions';
import { X, Briefcase, Calendar, DollarSign, FileText } from 'lucide-react';

type Tab = 'datos' | 'fechas' | 'finanzas' | 'notas';

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
    const [activeTab, setActiveTab] = useState<Tab>('datos');

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
            <div className="bg-[#1e293b] w-full max-w-2xl max-h-[90vh] flex flex-col relative rounded-2xl border border-sky-500/20 shadow-2xl shadow-sky-500/10 animate-in fade-in zoom-in duration-200 overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-[100] p-2 hover:bg-white/5 rounded-full"
                >
                    <X size={24} />
                </button>

                <div className="p-6 md:p-8 pb-4 border-b border-white/5 shrink-0">
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                        {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Gestión de datos del proyecto</p>
                </div>

                <div className="flex px-6 md:px-8 gap-4 border-b border-white/5 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('datos')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'datos' ? 'text-sky-400 border-sky-400' : 'text-slate-500 border-transparent hover:text-white'}`}
                    >
                        <Briefcase size={16} />
                        Datos
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('fechas')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'fechas' ? 'text-sky-400 border-sky-400' : 'text-slate-500 border-transparent hover:text-white'}`}
                    >
                        <Calendar size={16} />
                        Fechas y Estado
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('finanzas')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'finanzas' ? 'text-sky-400 border-sky-400' : 'text-slate-500 border-transparent hover:text-white'}`}
                    >
                        <DollarSign size={16} />
                        Finanzas
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('notas')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'notas' ? 'text-sky-400 border-sky-400' : 'text-slate-500 border-transparent hover:text-white'}`}
                    >
                        <FileText size={16} />
                        Notas
                    </button>
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
                    <div className="p-6 md:p-8 pt-6 space-y-6 flex-1">

                        {/* TAB: DATOS */}
                        <div className={`space-y-4 ${activeTab === 'datos' ? 'block' : 'hidden'}`}>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Nombre del Proyecto *</label>
                                <input
                                    name="name"
                                    required
                                    defaultValue={project?.name}
                                    autoFocus={!project}
                                    placeholder="Ej: Desarrollo Web Cliente XYZ"
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Descripción</label>
                                <textarea
                                    name="description"
                                    defaultValue={project?.description}
                                    placeholder="Descripción breve del proyecto..."
                                    rows={3}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Propietario / Responsable *</label>
                                    <div className="relative">
                                        <select
                                            name="ownerId"
                                            required
                                            defaultValue={project?.ownerId}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 cursor-pointer appearance-none"
                                        >
                                            <option value="">Seleccionar responsable...</option>
                                            {employees.map(e => <option key={e.id} value={e.id} className="bg-slate-900">{e.firstName} {e.lastName}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Categoría</label>
                                    <input
                                        name="category"
                                        defaultValue={project?.category}
                                        placeholder="Ej: Desarrollo, Consultoría"
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* TAB: FECHAS Y ESTADO */}
                        <div className={`space-y-4 ${activeTab === 'fechas' ? 'block' : 'hidden'}`}>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Estado</label>
                                    <div className="relative">
                                        <select
                                            name="status"
                                            defaultValue={project?.status || 'En curso'}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 cursor-pointer appearance-none"
                                        >
                                            <option value="En curso">En curso</option>
                                            <option value="Completado">Completado</option>
                                            <option value="Retrasado">Retrasado</option>
                                            <option value="Pendiente">Pendiente</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Prioridad</label>
                                    <div className="relative">
                                        <select
                                            name="priority"
                                            defaultValue={project?.priority || '(2) Normal'}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 cursor-pointer appearance-none"
                                        >
                                            <option value="(1) Alta">(1) Alta</option>
                                            <option value="(2) Normal">(2) Normal</option>
                                            <option value="(3) Baja">(3) Baja</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Inicio</label>
                                        <input
                                            name="startDate"
                                            type="date"
                                            defaultValue={project?.startDate}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Término</label>
                                        <input
                                            name="endDate"
                                            type="date"
                                            defaultValue={project?.endDate}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TAB: FINANZAS */}
                        <div className={`space-y-4 ${activeTab === 'finanzas' ? 'block' : 'hidden'}`}>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Ingreso Esperado (CLP)</label>
                                <div className="relative">
                                    <input
                                        name="expectedIncome"
                                        type="number"
                                        step="0.01"
                                        defaultValue={project?.expectedIncome || "0"}
                                        onFocus={(e) => (e.target as HTMLInputElement).select()}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-500/50">CLP</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Utilidad Estimada</label>
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
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Días Presupuesto</label>
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

                        {/* TAB: NOTAS */}
                        <div className={`space-y-4 ${activeTab === 'notas' ? 'block' : 'hidden'}`}>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Notas Rápidas</label>
                                <textarea
                                    name="notes"
                                    defaultValue={project?.notes}
                                    placeholder="Notas generales..."
                                    rows={4}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Observaciones Detalladas</label>
                                <textarea
                                    name="observations"
                                    defaultValue={project?.observations}
                                    placeholder="Detalles importantes..."
                                    rows={6}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all resize-none"
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
