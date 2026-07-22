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
        observations: tasks.observations,
    })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .leftJoin(employees, eq(tasks.employeeId, employees.id))
        .where(or(eq(tasks.status, 'Pendiente'), eq(tasks.status, 'En curso'), eq(tasks.status, 'Retrasado')))
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

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-slate-400 uppercase text-[10px] tracking-wider font-black">
                                <th className="px-6 py-4">Proyecto</th>
                                <th className="px-6 py-4">Título Tarea</th>
                                <th className="px-6 py-4">Observación</th>
                                <th className="px-6 py-4">Asignado a</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-center">Vencimiento</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {pendingTasks.map((t: any) => (
                                <tr key={t.id} className="hover:bg-white/5 transition-colors border-b border-white/5">
                                    <td className="px-6 py-4 text-sm font-bold text-sky-400">
                                        <Link href={`/projects/${t.projectId}`} className="hover:underline">
                                            {t.projectName}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white font-medium">
                                        {t.title}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate" title={t.observations || ''}>
                                        {t.observations || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {t.assignedTo || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold ${
                                            t.status === 'Retrasado' ? 'bg-rose-500/10 text-rose-400' :
                                            t.status === 'En curso' ? 'bg-amber-500/10 text-amber-400' :
                                            'bg-sky-500/10 text-sky-400'
                                        }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400 text-center">
                                        {t.dueDate ? t.dueDate.split('-').reverse().join('/') : 'Sin fecha'}
                                    </td>
                                </tr>
                            ))}
                            {pendingTasks.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">
                                        ¡Excelente! No hay tareas pendientes o retrasadas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
