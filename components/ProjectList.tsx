'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import { deleteProject } from '@/lib/project-actions';

interface Project {
    id: number;
    name: string;
    category: string;
    status: string;
    priority: string;
    startDate: string;
    expectedIncome: number;
    ownerName: string;
    isArchived: boolean;
    lastActionAt: string;
    balance?: number;
    netBalance?: number;
    taxBalance?: number;
}

export default function ProjectList({ projects, canManage = false }: { projects: Project[], canManage?: boolean }) {
    const [filter, setFilter] = useState<'todos' | 'activos' | 'completados'>('activos');

    const filteredProjects = projects.filter((p) => {
        if (filter === 'todos') return true;
        if (filter === 'activos') return !p.isArchived && p.status !== 'Completado';
        if (filter === 'completados') return p.isArchived || p.status === 'Completado';
        return true;
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                <button
                    onClick={() => setFilter('todos')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'todos' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFilter('activos')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'activos' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    En curso
                </button>
                <button
                    onClick={() => setFilter('completados')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'completados' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Completado
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredProjects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="glass-card p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-white/5 transition-all group gap-4 md:gap-0"
                    >
                        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${(project.isArchived || project.status === 'Completado') ? 'bg-slate-500/10 text-slate-500' : 'bg-sky-500/10 text-sky-400'}`}>
                                <Briefcase size={20} className="md:w-6 md:h-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base md:text-lg font-bold text-white group-hover:text-sky-400 transition-colors truncate">
                                    {project.name}
                                    {(project.isArchived || project.status === 'Completado') && <span className="ml-2 md:ml-3 text-[9px] md:text-[10px] bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-black border border-white/5 align-middle">Finalizado</span>}
                                </h3>
                                <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-slate-400 mt-1">
                                    <span className="flex items-center gap-1 shrink-0"><Calendar size={12} className="md:w-[14px] md:h-[14px]" /> {project.startDate}</span>
                                    <span className="hidden md:inline">•</span>
                                    <span className="truncate max-w-[100px] md:max-w-none">{project.category}</span>
                                    <span className="hidden md:inline">•</span>
                                    <span className="text-sky-300 font-medium truncate max-w-[100px] md:max-w-none">{project.ownerName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between w-full md:w-auto md:gap-8 border-t border-white/5 pt-3 md:pt-0 md:border-t-0">
                            <div className="flex gap-4 md:gap-8">
                                <div className="text-left md:text-right">
                                    <p className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-wider">Última Acción</p>
                                    <p className="text-xs md:text-sm font-bold text-slate-400">{project.lastActionAt}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-wider">Disponible</p>
                                    <p className={`text-base md:text-lg font-bold ${(project.netBalance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {formatCurrency(project.netBalance || 0)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:gap-4">
                                <div className={`hidden md:block px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase 
                                    ${project.status === 'Retrasado' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                        project.status === 'Pendiente' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                            (project.isArchived || project.status === 'Completado') ? 'bg-slate-500/10 text-slate-400' :
                                                'bg-sky-500/10 text-sky-400'
                                    }`}>
                                    {project.isArchived ? 'Archivado' : project.status}
                                </div>

                                {canManage && (
                                    <button
                                        onClick={async (e) => {
                                            e.preventDefault(); // Prevent navigation
                                            e.stopPropagation();
                                            if (confirm(`¿Estás seguro de eliminar el proyecto "${project.name}"?\nEsta acción es irreversible.`)) {
                                                const res = await deleteProject(project.id);
                                                if (!res.success) {
                                                    alert(res.message);
                                                }
                                            }
                                        }}
                                        className="p-1.5 md:p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors z-10"
                                        title="Eliminar proyecto"
                                    >
                                        <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                                    </button>
                                )}

                                <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-slate-600 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                    </Link>
                ))}

                {filteredProjects.length === 0 && (
                    <div className="py-20 text-center glass-card">
                        <p className="text-slate-500 italic">No hay proyectos que coincidan con este filtro.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
