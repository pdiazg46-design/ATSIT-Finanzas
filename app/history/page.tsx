import { db } from '@/lib/db';
import { projects, employees } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import Link from 'next/link';
import { Archive, Briefcase, Calendar, ChevronRight } from 'lucide-react';

export default async function HistoryPage() {
    const archivedProjects = await db.select({
        id: projects.id,
        name: projects.name,
        category: projects.category,
        status: projects.status,
        startDate: projects.startDate,
        expectedIncome: projects.expectedIncome,
        ownerName: sql<string>`${employees.firstName} || ' ' || ${employees.lastName}`
    })
        .from(projects)
        .leftJoin(employees, eq(projects.ownerId, employees.id))
        .where(eq(projects.isArchived, true))
        .all();

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Archive className="text-slate-400" />
                    Histórico de Proyectos
                </h2>
                <p className="text-slate-400">Proyectos archivados y finalizados</p>
            </header>

            <div className="grid grid-cols-1 gap-4 opacity-75">
                {archivedProjects.map((project: any) => (
                    <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="glass-card p-6 flex items-center justify-between hover:bg-white/5 transition-all group"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-slate-500/10 rounded-xl flex items-center justify-center text-slate-400">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">{project.name}</h3>
                                <div className="flex gap-4 text-sm text-slate-400 mt-1">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {project.startDate}</span>
                                    <span>{project.category}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Presupuesto Final</p>
                                <p className="text-lg font-bold text-slate-300">{formatCurrency(project.expectedIncome || 0)}</p>
                            </div>
                            <ChevronRight className="text-slate-600" />
                        </div>
                    </Link>
                ))}
                {archivedProjects.length === 0 && (
                    <div className="glass-card p-12 text-center text-slate-500 italic">
                        No hay proyectos en el historial.
                    </div>
                )}
            </div>
        </div>
    );
}
