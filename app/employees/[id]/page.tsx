import { db } from '@/lib/db';
import { employees, projects, tasks, movements, documents } from '@/lib/schema';
import { eq, or, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ArrowLeft, Briefcase, CheckCircle2, Clock, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    const employee = await db.select().from(employees).where(eq(employees.id, id)).get();
    if (!employee) notFound();

    // Proyectos donde es propietario
    const ownedProjects = await db.select().from(projects).where(eq(projects.ownerId, id)).all();

    // Tareas asignadas y sus proyectos
    const employeeTasks = await db.select({
        taskId: tasks.id,
        taskTitle: tasks.title,
        projectName: projects.name,
        projectId: projects.id,
        status: tasks.status,
        netValue: tasks.netValue,
        totalValue: tasks.totalValue
    })
        .from(tasks)
        .innerJoin(projects, eq(tasks.projectId, projects.id))
        .where(eq(tasks.employeeId, id))
        .all();

    // Consolidar proyectos donde participa con tareas pero no es dueño
    const projectIdsParticipating = [...new Set(employeeTasks.map((t: any) => t.projectId))];
    const participatingProjectsResults = await Promise.all(
        projectIdsParticipating
            .filter(pid => !ownedProjects.find((op: any) => op.id === pid))
            .map((pid: any) => db.select().from(projects).where(eq(projects.id, Number(pid))).get())
    );

    const participatingProjects = participatingProjectsResults.filter((p: any): p is NonNullable<typeof p> => p !== undefined);
    const allProjects = [...ownedProjects, ...participatingProjects];

    const formatCurrency = (val: number | null) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4">
                <Link href="/employees" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit">
                    <ArrowLeft size={20} />
                    Volver al Directorio
                </Link>

                <div className="flex items-center gap-6 bg-white/5 p-8 rounded-3xl border border-white/10">
                    <div className="w-24 h-24 bg-sky-500/10 rounded-full flex items-center justify-center text-sky-400 border-2 border-sky-500/20 shadow-xl shadow-sky-500/10">
                        <span className="text-4xl font-bold">{employee.firstName[0]}{employee.lastName[0]}</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white">{employee.firstName} {employee.lastName}</h1>
                        <p className="text-sky-400 font-medium text-lg uppercase tracking-wider mt-1">{employee.position || 'Colaborador'}</p>
                        <div className="flex flex-wrap gap-4 mt-4 text-slate-400 text-sm">
                            {employee.email && <span className="flex items-center gap-2"><Mail size={16} /> {employee.email}</span>}
                            {employee.phoneMobile && <span className="flex items-center gap-2"><Phone size={16} /> {employee.phoneMobile}</span>}
                            {employee.organization && <span className="flex items-center gap-2"><Briefcase size={16} /> {employee.organization}</span>}
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna: Proyectos */}
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Briefcase className="text-sky-400" size={20} />
                        Proyectos Vinculados
                    </h2>
                    <div className="space-y-4">
                        {allProjects.map(proj => (
                            <Link key={proj.id} href={`/projects/${proj.id}`}>
                                <div className="glass-card p-5 hover:bg-white/10 transition-all cursor-pointer border-l-4 border-sky-500/50 mb-3">
                                    <h3 className="font-bold text-white mb-1">{proj.name}</h3>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 uppercase font-black">{proj.category}</span>
                                        <span className={`px-2 py-0.5 rounded ${proj.ownerId === id ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                                            {proj.ownerId === id ? 'Dueño' : 'Colaborador'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {allProjects.length === 0 && (
                            <p className="text-slate-500 italic text-sm">No participa en ningún proyecto activo.</p>
                        )}
                    </div>
                </div>

                {/* Columna: Tareas */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="text-emerald-400" size={20} />
                        Tareas y Movimientos Asignados
                    </h2>
                    <div className="glass-card overflow-hidden border-emerald-500/10">
                        <table className="w-full text-left">
                            <thead className="bg-white/5">
                                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                    <th className="px-6 py-4">Proyecto</th>
                                    <th className="px-6 py-4">Concepto</th>
                                    <th className="px-6 py-4 text-right">Valor</th>
                                    <th className="px-6 py-4 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {employeeTasks.map((task: any) => (
                                    <tr key={task.taskId} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 text-xs font-bold text-sky-400">
                                            <Link href={`/projects/${task.projectId}`} className="hover:underline">
                                                {task.projectName}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white">{task.taskTitle}</td>
                                        <td className="px-6 py-4 text-sm text-right font-mono text-emerald-400">{formatCurrency(task.totalValue)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-bold uppercase italic">
                                                {task.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {employeeTasks.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">No tiene tareas asignadas.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
