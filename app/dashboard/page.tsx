import { db } from '@/lib/db';
import { projects, tasks, vatPayments } from '@/lib/schema';
export const dynamic = 'force-dynamic';
import { eq, sql, desc, and, isNotNull, not } from 'drizzle-orm';
import Link from 'next/link';
import { Briefcase, CreditCard, Clock, ArrowRight, DollarSign, TrendingUp, Wallet, Scale, ChevronRight } from 'lucide-react';

export default async function DashboardPage() {
    // Fetch summary data
    const activeProjectsCount = await db.select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(and(eq(projects.isArchived, false), sql`${projects.status} != 'Completado'`))
        .get();

    // 2. CASH BASIS CALCULATION (Real Money in Bank) - MIRRORED FROM MAIN PAGE
    // Income: Tasks with paymentDate (Gross Value)
    const cashIncomeResult = await db.select({
        amount: sql<number>`SUM(${tasks.totalValue})`
    })
        .from(tasks)
        .where(and(
            isNotNull(tasks.paymentDate),
            not(eq(tasks.paymentDate, '')),
            sql`${tasks.netValue} > 0`
        ))
        .get();

    // Expenses: Tasks with paymentDate (Gross Value)
    const cashExpensesResult = await db.select({
        amount: sql<number>`SUM(${tasks.totalValue})`
    })
        .from(tasks)
        .where(and(
            isNotNull(tasks.paymentDate),
            not(eq(tasks.paymentDate, '')),
            sql`${tasks.netValue} < 0`
        ))
        .get();

    // VAT Payments (Always paid)
    const totalVatPaymentsResult = await db.select({
        amount: sql<number>`SUM(${vatPayments.amount})`
    }).from(vatPayments).get();

    const cashIncome = cashIncomeResult?.amount || 0;
    const cashExpensesCommon = Math.abs(cashExpensesResult?.amount || 0);
    const cashVatPayments = totalVatPaymentsResult?.amount || 0;

    const totalCashExpenses = cashExpensesCommon + cashVatPayments;
    const cashBalance = cashIncome - totalCashExpenses;

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

    return (
        <div className="space-y-6 md:space-y-8">
            <header>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h2>
                <p className="text-sm md:text-base text-slate-400">Resumen general de tu gestión (v2.1)</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Active Projects */}
                <div className="glass-card p-4 md:p-6 space-y-2 md:space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Briefcase size={48} className="md:w-16 md:h-16" />
                    </div>
                    <div>
                        <p className="text-slate-400 font-medium text-xs md:text-base">Proyectos Activos</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">{activeProjectsCount?.count || 0}</h3>
                    </div>
                    <Link href="/projects" className="inline-flex items-center text-sky-400 text-[10px] md:text-xs font-bold hover:text-sky-300 transition-colors uppercase tracking-wider">
                        Ver todos <ArrowRight size={14} className="ml-1" />
                    </Link>
                </div>

                {/* Income (Cash) */}
                <div className="glass-card p-4 md:p-6 space-y-2 md:space-y-4 relative overflow-hidden group border-emerald-500/20 bg-emerald-500/5">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
                        <TrendingUp size={48} className="md:w-16 md:h-16" />
                    </div>
                    <div>
                        <p className="text-emerald-500/60 font-medium uppercase tracking-wider text-[10px] md:text-xs">Ingresos Percibidos</p>
                        <h3 className="text-xl md:text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(cashIncome)}</h3>
                    </div>
                    <Link href="/reports" className="inline-flex items-center text-emerald-400 text-[10px] md:text-xs font-bold hover:text-emerald-300 transition-colors uppercase tracking-wider">
                        Ver detalles <ArrowRight size={14} className="ml-1" />
                    </Link>
                </div>

                {/* Expenses (Cash) */}
                <div className="glass-card p-4 md:p-6 space-y-2 md:space-y-4 relative overflow-hidden group border-rose-500/20 bg-rose-500/5">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-rose-500">
                        <Wallet size={48} className="md:w-16 md:h-16" />
                    </div>
                    <div>
                        <p className="text-rose-500/60 font-medium uppercase tracking-wider text-[10px] md:text-xs">Gastos Reales</p>
                        <h3 className="text-xl md:text-2xl font-bold text-rose-400 mt-1">{formatCurrency(totalCashExpenses)}</h3>
                    </div>
                    <Link href="/reports" className="inline-flex items-center text-rose-400 text-[10px] md:text-xs font-bold hover:text-rose-300 transition-colors uppercase tracking-wider">
                        Ver detalles <ArrowRight size={14} className="ml-1" />
                    </Link>
                </div>

                {/* Balance (Cash) */}
                <Link href="/reports/bank-audit" className="glass-card p-4 md:p-6 space-y-2 md:space-y-4 relative overflow-hidden group border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 transition-colors cursor-pointer block">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-sky-500">
                        <Scale size={48} className="md:w-16 md:h-16" />
                    </div>
                    <div>
                        <p className="text-sky-500/60 font-medium uppercase tracking-wider text-[10px] md:text-xs">Saldo en Banco</p>
                        <h3 className={`text-xl md:text-2xl font-bold mt-1 ${cashBalance >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>{formatCurrency(cashBalance)}</h3>
                    </div>
                    <span className="inline-flex items-center text-sky-400/50 text-[10px] md:text-xs font-bold uppercase tracking-wider group-hover:text-sky-300">
                        Auditar <ChevronRight size={14} className="ml-1" />
                    </span>
                </Link>
            </div>

            <section>
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">Actividad Reciente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {recentProjects.map((project: any) => (
                        <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="glass-card p-3 md:p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                                    <Briefcase size={16} className="md:w-5 md:h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-white text-sm md:text-base group-hover:text-sky-400 transition-colors truncate">{project.name}</h4>
                                    <p className="text-[10px] md:text-xs text-slate-400 truncate">{project.category}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 md:gap-6 text-right shrink-0">
                                <div className="hidden sm:block">
                                    <p className="text-[10px] md:text-xs text-slate-500">Disponible</p>
                                    <p className={`text-xs md:text-sm font-bold ${project.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {formatCurrency(project.netBalance)}
                                    </p>
                                </div>
                                <div className="w-20 md:w-24">
                                    <p className="text-[10px] md:text-xs text-slate-500 uppercase md:normal-case font-bold md:font-normal">Hace</p>
                                    <p className="text-xs md:text-sm font-bold text-slate-400">
                                        {project.lastActionAt ? (() => {
                                            const date = new Date(project.lastActionAt);
                                            // Simple "time ago" logic or just short date
                                            const now = new Date();
                                            const diff = now.getTime() - date.getTime();
                                            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                            if (days === 0) return 'Hoy';
                                            if (days === 1) return 'Ayer';
                                            if (days < 7) return `${days} días`;
                                            return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
                                        })() : '-'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {recentProjects.length === 0 && (
                        <p className="text-slate-500 italic text-sm">No hay actividad reciente.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
