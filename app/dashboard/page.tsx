import { db } from '@/lib/db';
import { projects, tasks } from '@/lib/schema';
import { eq, sql, desc, and } from 'drizzle-orm';
import Link from 'next/link';
import { Briefcase, CreditCard, Clock, ArrowRight, DollarSign } from 'lucide-react';

export default async function DashboardPage() {
    // Fetch summary data
    const activeProjectsCount = await db.select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(and(eq(projects.isArchived, false), sql`${projects.status} != 'Completado'`))
        .get();

    const stats = await db.select({
        totalIncome: sql<number>`SUM(CASE WHEN ${tasks.netValue} > 0 THEN ${tasks.netValue} ELSE 0 END)`,
        totalExpenses: sql<number>`SUM(CASE WHEN ${tasks.netValue} < 0 THEN ABS(${tasks.netValue}) ELSE 0 END)`,
        pendingTasks: sql<number>`count(*)`
    })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .where(eq(projects.isArchived, false))
        .get();

    // Fetch recent projects
    const recentProjects = await db.select({
        id: projects.id,
        name: projects.name,
        category: projects.category,
        lastActionAt: projects.lastActionAt,
        netBalance: sql<number>`COALESCE(SUM(${tasks.netValue}), 0)`
    })
        .from(projects)
        .leftJoin(tasks, eq(projects.id, tasks.projectId))
        .where(eq(projects.isArchived, false))
        .groupBy(projects.id)
        .orderBy(
            sql`CASE 
                WHEN ${projects.name} IN ('Gastos Comunes', 'Ahorro 10%') THEN 0 
                ELSE 1 
            END`,
            desc(projects.lastActionAt)
        )
        .limit(4)
        .all();

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    const income = stats?.totalIncome || 0;
    const expenses = stats?.totalExpenses || 0;
    const balance = income - expenses;

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-white">Dashboard</h2>
                <p className="text-slate-400">Resumen general de tu gestión</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Active Projects */}
                <div className="glass-card p-6 space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Briefcase size={64} />
                    </div>
                    <div>
                        <p className="text-slate-400 font-medium">Proyectos Activos</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{activeProjectsCount?.count || 0}</h3>
                    </div>
                    <Link href="/projects" className="inline-flex items-center text-sky-400 text-xs font-bold hover:text-sky-300 transition-colors uppercase tracking-wider">
                        Ver todos <ArrowRight size={14} className="ml-1" />
                    </Link>
                </div>

                {/* Income */}
                <div className="glass-card p-6 space-y-4 relative overflow-hidden group border-emerald-500/20 bg-emerald-500/5">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
                        <CreditCard size={64} />
                    </div>
                    <div>
                        <p className="text-emerald-500/60 font-medium uppercase tracking-wider text-xs">Ingresos</p>
                        <h3 className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(income)}</h3>
                    </div>
                    <Link href="/reports" className="inline-flex items-center text-emerald-400 text-xs font-bold hover:text-emerald-300 transition-colors uppercase tracking-wider">
                        Ver detalles <ArrowRight size={14} className="ml-1" />
                    </Link>
                </div>

                {/* Expenses */}
                <div className="glass-card p-6 space-y-4 relative overflow-hidden group border-rose-500/20 bg-rose-500/5">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-rose-500">
                        <CreditCard size={64} />
                    </div>
                    <div>
                        <p className="text-rose-500/60 font-medium uppercase tracking-wider text-xs">Gastos</p>
                        <h3 className="text-2xl font-bold text-rose-400 mt-1">{formatCurrency(expenses)}</h3>
                    </div>
                    <Link href="/reports" className="inline-flex items-center text-rose-400 text-xs font-bold hover:text-rose-300 transition-colors uppercase tracking-wider">
                        Ver detalles <ArrowRight size={14} className="ml-1" />
                    </Link>
                </div>

                {/* Balance */}
                <div className="glass-card p-6 space-y-4 relative overflow-hidden group border-sky-500/20 bg-sky-500/5">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-sky-500">
                        <DollarSign size={64} />
                    </div>
                    <div>
                        <p className="text-sky-500/60 font-medium uppercase tracking-wider text-xs">Saldo Total</p>
                        <h3 className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>{formatCurrency(balance)}</h3>
                    </div>
                    <span className="inline-flex items-center text-sky-400/50 text-xs font-bold uppercase tracking-wider cursor-default">
                        Rentabilidad
                    </span>
                </div>
            </div>

            <section>
                <h3 className="text-xl font-bold text-white mb-4">Actividad Reciente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentProjects.map((project: any) => (
                        <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="glass-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                                    <Briefcase size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white group-hover:text-sky-400 transition-colors">{project.name}</h4>
                                    <p className="text-xs text-slate-400">{project.category}</p>
                                </div>
                            </div>
                            <div className="flex gap-6 text-right">
                                <div>
                                    <p className="text-xs text-slate-500">Disponible</p>
                                    <p className={`text-sm font-bold ${project.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {formatCurrency(project.netBalance)}
                                    </p>
                                </div>
                                <div className="w-24">
                                    <p className="text-xs text-slate-500">Última acción</p>
                                    <p className="text-sm font-bold text-slate-400">
                                        {project.lastActionAt ? new Date(project.lastActionAt).toLocaleDateString('es-CL', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'Sin actividad'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {recentProjects.length === 0 && (
                        <p className="text-slate-500 italic">No hay actividad reciente.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
