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

export default function ProjectList({ projects }: { projects: Project[] }) {
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
                        className="glass-card p-6 flex items-center justify-between hover:bg-white/5 transition-all group"
                    >
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${(project.isArchived || project.status === 'Completado') ? 'bg-slate-500/10 text-slate-500' : 'bg-sky-500/10 text-sky-400'}`}>
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">
                                    {project.name}
                                    {(project.isArchived || project.status === 'Completado') && <span className="ml-3 text-[10px] bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-black border border-white/5">Completado</span>}
                                </h3>
                                <div className="flex gap-4 text-sm text-slate-400 mt-1">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {project.startDate}</span>
                                    <span>{project.category}</span>
                                    <span className="text-sky-300 font-medium">{project.ownerName}</span>
                                </div>
                            </div>
                        </div>



                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Última Acción</p>
                                <p className="text-sm font-bold text-slate-400">{project.lastActionAt}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Disponible</p>
                                <p className={`text-lg font-bold ${(project.netBalance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {formatCurrency(project.netBalance || 0)}
                                </p>
                            </div>
                            {/* Removed VAT column */}
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase 
                                ${project.status === 'Retrasado' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                    project.status === 'Pendiente' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                        (project.isArchived || project.status === 'Completado') ? 'bg-slate-500/10 text-slate-400' :
                                            'bg-sky-500/10 text-sky-400'
                                }`}>
                                {project.isArchived ? 'Archivado' : project.status}
                            </div>

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
                                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors z-10"
                                title="Eliminar proyecto"
                            >
                                <Trash2 size={18} />
                            </button>

                            <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
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
