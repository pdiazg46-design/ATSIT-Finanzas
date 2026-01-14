import { db } from '@/lib/db';
import { projects, employees, tasks, movements, documents } from '@/lib/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, DollarSign, Clock, FileText, Archive, Play, MapPin } from 'lucide-react';
import Link from 'next/link';
import { archiveProject, activateProject } from '@/lib/project-actions';
import ProjectTaskTable from '@/components/ProjectTaskTable';
import EditProjectButton from '@/components/EditProjectButton';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    const project = await db.select().from(projects).where(eq(projects.id, id)).get();
    if (!project) notFound();

    const owner = project.ownerId ? await db.select().from(employees).where(eq(employees.id, project.ownerId)).get() : null;

    // Lookup data for the AddTask form
    const [allEmployees, allMovements, allDocuments] = await Promise.all([
        db.select().from(employees).all(),
        db.select().from(movements).all(),
        db.select().from(documents).all(),
    ]);

    const projectTasks = await db.select({
        id: tasks.id,
        title: tasks.title,
        assignedTo: sql<string>`${employees.firstName} || ' ' || ${employees.lastName}`,
        movement: movements.name,
        document: documents.name,
        docNumber: tasks.docNumber,
        netValue: tasks.netValue,
        taxValue: tasks.taxValue,
        totalValue: tasks.totalValue,
        costDays: tasks.costDays,
        status: tasks.status,
        startDate: tasks.startDate,
        dueDate: tasks.dueDate,
        paymentDate: tasks.paymentDate,
        observations: tasks.observations,
        employeeId: tasks.employeeId,
        movementId: tasks.movementId,
        documentId: tasks.documentId,
        lastActionAt: tasks.lastActionAt,
    })
        .from(tasks)
        .leftJoin(employees, eq(tasks.employeeId, employees.id))
        .leftJoin(movements, eq(tasks.movementId, movements.id))
        .leftJoin(documents, eq(tasks.documentId, documents.id))
        .where(eq(tasks.projectId, id))
        .orderBy(desc(tasks.lastActionAt))
        .all();

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    // Operational Logic Formulas
    const realIncome = projectTasks.filter((t: any) => (t.netValue || 0) > 0).reduce((acc: any, t: any) => acc + (t.netValue || 0), 0);
    const pendingBalance = (project.expectedIncome || 0) - realIncome;

    const totalNetIncome = projectTasks.reduce((acc: any, t: any) => acc + (t.netValue || 0), 0);
    const totalTaxBalance = projectTasks.reduce((acc: any, t: any) => acc + (t.taxValue || 0), 0);
    // const totalCashBalance = projectTasks.reduce((acc: any, t: any) => acc + (t.totalValue || 0), 0);

    const totalExpenses = Math.abs(projectTasks.filter((t: any) => (t.netValue || 0) < 0).reduce((acc: any, t: any) => acc + (t.netValue || 0), 0));

    // const totalCostDays = projectTasks.reduce((acc, t) => acc + (t.costDays || 0), 0);
    // const balanceDays = (project.budgetDays || 0) - totalCostDays;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <Link href={project.isArchived ? "/history" : "/projects"} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    Volver a {project.isArchived ? "Historial" : "Proyectos"}
                </Link>

                <div className="flex gap-3">
                    <EditProjectButton project={project} employees={allEmployees} />
                    <form action={async () => {
                        'use server';
                        if (project.isArchived) {
                            await activateProject(id);
                        } else {
                            await archiveProject(id);
                        }
                    }}>
                        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${project.isArchived
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-slate-500/10 text-slate-400 hover:bg-slate-500/20"
                            }`}>
                            {project.isArchived ? <Play size={18} /> : <Archive size={18} />}
                            {project.isArchived ? "Activar Proyecto" : "Archivar Proyecto"}
                        </button>
                    </form>
                </div>
            </div>

            <header className="flex justify-between items-start">
                <div className="flex-1">
                    <h1 className="text-4xl font-bold text-white">{project.name}</h1>
                    <div className="flex flex-wrap gap-4 mt-2 text-slate-400">
                        <span className="flex items-center gap-1"><User size={16} /> {owner ? `${owner.firstName} ${owner.lastName}` : 'Sin propietario'}</span>
                        <span className="flex items-center gap-1"><Calendar size={16} /> {project.startDate}</span>
                        <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded text-xs font-bold uppercase">{project.category}</span>
                        {owner?.city && <span className="flex items-center gap-1"><MapPin size={16} /> {owner.city}{owner.stateProvince ? `, ${owner.stateProvince}` : ''}</span>}
                    </div>
                    {project.description && (
                        <p className="mt-4 text-slate-300 max-w-3xl leading-relaxed italic border-l-2 border-sky-500/30 pl-4">
                            {project.description}
                        </p>
                    )}
                </div>
                <div className={`glass-card px-6 py-3 border-emerald-500/20 ${(project.isArchived || project.status === 'Completado') ? 'border-slate-500/20' : ''}`}>
                    <p className="text-xs text-slate-500 uppercase">Estado del proyecto</p>
                    <p className={`text-lg font-bold ${(project.isArchived || project.status === 'Completado') ? 'text-slate-400' : 'text-sky-400'}`}>
                        {project.isArchived || project.status === 'Completado' ? 'Completado' : project.status}
                    </p>
                    {project.lastActionAt && <p className="text-[10px] text-slate-500 uppercase mt-1">Acción: {project.lastActionAt}</p>}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 text-emerald-400 mb-2">
                        <DollarSign size={20} />
                        <p className="text-sm font-medium">Ingreso Esperado</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(project.expectedIncome || 0)}</p>
                </div>

                <div className="glass-card p-6 relative overflow-hidden">
                    <div className="flex items-center gap-3 text-sky-400 mb-2">
                        <DollarSign size={20} />
                        <p className="text-sm font-medium">Ingreso Real</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(realIncome)}</p>
                    <div className={`mt-2 text-xs font-bold px-2 py-1 rounded w-fit ${pendingBalance > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {pendingBalance > 0 ? 'Falta: ' : 'A Favor: '}
                        {formatCurrency(Math.abs(pendingBalance))}
                    </div>
                </div>

                <div className="glass-card p-6 bg-sky-500/5">
                    <div className="flex items-center gap-3 text-sky-400 mb-2">
                        <DollarSign size={20} />
                        <p className="text-sm font-medium">Saldo Neto</p>
                    </div>
                    <p className={`text-2xl font-bold ${totalNetIncome >= 0 ? 'text-white' : 'text-rose-400'}`}>
                        {formatCurrency(totalNetIncome)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Utilidad/Pérdida (Sin IVA)</p>
                </div>
            </div>

            {project.observations && (
                <section className="glass-card p-8 border-sky-500/20">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                        <FileText size={20} className="text-sky-400" />
                        Observaciones del Proyecto
                    </h3>
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-white/5 white-space-pre-wrap text-slate-300 leading-relaxed italic">
                        {project.observations}
                    </div>
                </section>
            )}

            <section className="glass-card p-0 overflow-hidden relative">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <FileText size={20} className="text-sky-400" />
                        Tareas del Proyecto
                    </h3>
                    <div className="flex gap-2 text-right">
                        <div className="text-xs text-slate-500 mr-4">
                            <p>Gastos Totales</p>
                            <p className="font-bold text-rose-400">{formatCurrency(totalExpenses)}</p>
                        </div>
                    </div>
                </div>
                <ProjectTaskTable
                    tasks={projectTasks}
                    projectId={id}
                    employees={allEmployees}
                    movements={allMovements}
                    documents={allDocuments}
                />
            </section>
        </div>
    );
}
