import { db } from '@/lib/db';
import { tasks, projects, employees } from '@/lib/schema';
import { eq, or, sql } from 'drizzle-orm';
import { ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import ExportButtons from '@/components/ExportButtons';

export default async function PendingTasksPage() {
    const pendingTasks = await db.select({
        id: tasks.id,
        title: tasks.title,
        projectName: projects.name,
        assignedTo: sql<string>`${employees.firstName} || ' ' || ${employees.lastName}`,
        status: tasks.status,
        dueDate: tasks.dueDate,
        projectId: projects.id,
    })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .leftJoin(employees, eq(tasks.employeeId, employees.id))
        .where(or(eq(tasks.status, 'En curso'), eq(tasks.status, 'Retrasado')))
        .all();

    const exportColumns = [
        { header: 'Título', key: 'title' },
        { header: 'Proyecto', key: 'projectName' },
        { header: 'Responsable', key: 'assignedTo' },
        { header: 'Estado', key: 'status' },
        { header: 'Fecha Vencimiento', key: 'dueDate' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <Link href="/reports" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    Volver a Informes
                </Link>
                <div className="flex gap-2">
                    <ExportButtons
                        data={pendingTasks}
                        columns={exportColumns}
                        fileName="tareas_pendientes"
                        title="Informe de Tareas Pendientes"
                    />
                </div>
            </div>

            <header>
                <h2 className="text-3xl font-bold text-white">Tareas Pendientes</h2>
                <p className="text-slate-400">Seguimiento de entregas y compromisos activos</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingTasks.map(t => (
                    <div key={t.id} className="glass-card p-6 flex flex-col justify-between hover:bg-white/5 transition-all">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.status === 'Retrasado' ? 'bg-rose-500/20 text-rose-400' : 'bg-sky-500/20 text-sky-400'}`}>
                                    {t.status}
                                </span>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock size={12} />
                                    Vence: {t.dueDate || 'Sin fecha'}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{t.title}</h3>
                            <p className="text-sm text-sky-400 font-medium mb-4">{t.projectName}</p>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <span className="text-xs text-slate-500 italic">Asignado: {t.assignedTo}</span>
                            <Link href={`/projects/${t.projectId}`} className="text-xs font-bold text-white hover:text-sky-400 transition-colors">
                                Ver Proyecto →
                            </Link>
                        </div>
                    </div>
                ))}
                {pendingTasks.length === 0 && (
                    <div className="col-span-full glass-card p-12 text-center text-slate-500 italic">
                        ¡Excelente! No hay tareas pendientes o retrasadas.
                    </div>
                )}
            </div>
        </div>
    );
}
