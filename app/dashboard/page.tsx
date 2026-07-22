import { db } from '@/lib/db';
import { projects, tasks, vatPayments, documents, movements } from '@/lib/schema';
export const dynamic = 'force-dynamic';
import { eq, sql, desc, and, isNotNull, not, like } from 'drizzle-orm';
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
        .leftJoin(movements, eq(tasks.movementId, movements.id))
        .where(and(
            isNotNull(tasks.paymentDate),
            not(eq(tasks.paymentDate, '')),
            sql`${tasks.netValue} < 0`,
            sql`(${movements.name} IS NULL OR ${movements.name} NOT LIKE 'Retiro%')`
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

    const activeProjects = await db.select({
        id: projects.id,
        name: projects.name,
        category: projects.category,
        lastActionAt: projects.lastActionAt,
        netBalance: sql<number>`COALESCE(SUM(CASE WHEN ${tasks.documentId} = 44 THEN ${tasks.totalValue} ELSE ${tasks.netValue} END), 0)`
    })
        .from(projects)
        .leftJoin(tasks, eq(projects.id, tasks.projectId))
        .where(eq(projects.isArchived, false))
        .groupBy(projects.id)
        .orderBy(
            desc(projects.lastActionAt)
        )
        .all();

    const totalAvailableInProjects = activeProjects.reduce((acc: number, p: any) => acc + (p.netBalance || 0), 0);

    // --- F29 UNIVERSAL TAX POOL (Dashboard Copy) ---
    // Instead of filtering by month, we load ALL historical debts and subtract ALL payments.
    const f29Components_dash = await Promise.all([
        // Sales (Invoices) Debt
        db.select({ amount: sql<number>`SUM(${tasks.taxValue})` })
            .from(tasks)
            .where(and(eq(tasks.documentId, 42), sql`${tasks.netValue} > 0`))
            .get(),
        // Purchases (Invoices) Credit
        db.select({ amount: sql<number>`SUM(${tasks.taxValue})` })
            .from(tasks)
            .where(and(eq(tasks.documentId, 42), sql`${tasks.netValue} < 0`))
            .get(),
        // Honorarios (Retentions) Debt
        db.select({ amount: sql<number>`SUM(${tasks.taxValue})` })
            .from(tasks)
            .where(eq(tasks.documentId, 44))
            .get(),
        // PPM Payments
        db.select({ amount: sql<number>`SUM(${tasks.totalValue})` })
            .from(tasks)
            .leftJoin(movements, eq(tasks.movementId, movements.id))
            .where(eq(movements.name, "Pago PPM"))
            .get()
    ]);

    const dash_f29Debit = f29Components_dash[0]?.amount || 0;
    const dash_f29Credit = Math.abs(f29Components_dash[1]?.amount || 0);
    const dash_f29Retentions = Math.abs(f29Components_dash[2]?.amount || 0);
    const dash_f29Ppm = Math.abs(f29Components_dash[3]?.amount || 0);

    const dash_f29VatPayable = Math.max(0, dash_f29Debit - dash_f29Credit);
    // The outstanding universal pool is the sum of all liabilities minus all payments made to the state
    const dash_totalF29Raw = dash_f29VatPayable + dash_f29Retentions; // PPM is paid from a project directly
    const dash_totalF29 = dash_totalF29Raw - cashVatPayments;

    const totalConsolidated = totalAvailableInProjects + dash_totalF29;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    return (
        <div className="space-y-6 md:space-y-8">
            <header>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h2>
                <p className="text-sm md:text-base text-slate-400">Resumen general de tu gestión (v2.1)</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                {/* 1. Active Projects Count */}
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

                {/* 2. Total Available in Projects -> TO PROJECTS */}
                <Link href="/projects" className="glass-card p-4 md:p-6 space-y-2 md:space-y-4 relative overflow-hidden group border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer block">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
                        <Scale size={48} className="md:w-16 md:h-16" />
                    </div>
                    <div>
                        <p className="text-emerald-500/60 font-medium uppercase tracking-wider text-[10px] md:text-xs group-hover:text-emerald-400">Saldo Total Neto</p>
                        <h3 className={`text-xl md:text-2xl font-bold mt-1 ${totalAvailableInProjects >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(totalAvailableInProjects)}
                        </h3>
                    </div>
                    <span className="inline-flex items-center text-emerald-400/50 text-[10px] md:text-xs font-bold hover:text-emerald-300 transition-colors uppercase tracking-wider">
                        Ver Proyectos <ArrowRight size={14} className="ml-1" />
                    </span>
                </Link>

                {/* 3. F29 (INSERTED) -> TO F29 SIMULATOR */}
                <Link href="/reports/f29" className="glass-card p-4 md:p-6 space-y-2 md:space-y-4 relative overflow-hidden group border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer block text-left">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-amber-500">
                        <DollarSign size={48} className="md:w-16 md:h-16" />
                    </div>
                    <div>
                        <p className="text-amber-500/60 font-medium uppercase tracking-wider text-[10px] md:text-xs group-hover:text-amber-400">Formulario 29</p>
                        <h3 className="text-xl md:text-2xl font-bold text-amber-400 mt-1">{formatCurrency(dash_totalF29)}</h3>
                    </div>
                    <span className="inline-flex items-center text-amber-400/50 text-[10px] md:text-xs font-bold hover:text-amber-300 transition-colors uppercase tracking-wider">
                        Simulador F29 <ArrowRight size={14} className="ml-1" />
                    </span>
                </Link>

                {/* 4. Total Consolidated (NEW) -> TO BALANCE REPORT */}
                <Link href="/reports/balance" className="glass-card p-4 md:p-6 space-y-2 md:space-y-4 relative overflow-hidden group border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer block">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
                        <CreditCard size={48} className="md:w-16 md:h-16" />
                    </div>
                    <div>
                        <p className="text-emerald-500/60 font-medium uppercase tracking-wider text-[10px] md:text-xs group-hover:text-emerald-400">Total Consolidado</p>
                        <h3 className={`text-xl md:text-2xl font-bold mt-1 ${totalConsolidated >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(totalConsolidated)}
                        </h3>
                    </div>
                    <span className="inline-flex items-center text-emerald-400/50 text-[10px] md:text-xs font-bold hover:text-emerald-300 transition-colors uppercase tracking-wider">
                        Ver Balance <ArrowRight size={14} className="ml-1" />
                    </span>
                </Link>

                {/* 5. Income (Cash) */}
                <div className="glass-card p-4 md:p-6 space-y-2 md:space-y-4 relative overflow-hidden group border-sky-500/20 bg-sky-500/5">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-sky-500">
                        <TrendingUp size={48} className="md:w-16 md:h-16" />
                    </div>
                    <div>
                        <p className="text-sky-500/60 font-medium uppercase tracking-wider text-[10px] md:text-xs">Ingresos Percibidos</p>
                        <h3 className="text-xl md:text-2xl font-bold text-sky-400 mt-1">{formatCurrency(cashIncome)}</h3>
                    </div>
                    <Link href="/reports" className="inline-flex items-center text-sky-400 text-[10px] md:text-xs font-bold hover:text-sky-300 transition-colors uppercase tracking-wider">
                        Ver detalles <ArrowRight size={14} className="ml-1" />
                    </Link>
                </div>
            </div>

            <section>
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">Proyectos Activos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {activeProjects.map((project: any) => (
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
                    {activeProjects.length === 0 && (
                        <p className="text-slate-500 italic text-sm">No hay actividad reciente.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
