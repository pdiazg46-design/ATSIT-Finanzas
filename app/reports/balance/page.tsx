import { db } from '@/lib/db';
export const dynamic = 'force-dynamic';
import { projects, tasks, vatPayments, movements } from '@/lib/schema';
import { eq, sql, and, not, isNotNull, like } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ExportButtons from '@/components/ExportButtons';

export default async function BalanceReportPage() {
    const reportData = await db.select({
        name: projects.name,
        expectedIncome: projects.expectedIncome,
        realIncomeNet: sql<number>`SUM(CASE WHEN ${tasks.netValue} > 0 THEN ${tasks.netValue} ELSE 0 END)`,
        expensesNet: sql<number>`SUM(CASE WHEN ${tasks.netValue} < 0 THEN ABS(CASE WHEN ${tasks.documentId} = 44 THEN ${tasks.totalValue} ELSE ${tasks.netValue} END) ELSE 0 END)`,
        totalTax: sql<number>`SUM(${tasks.taxValue})`,
        balance: sql<number>`SUM(CASE WHEN ${tasks.documentId} = 44 THEN ${tasks.totalValue} ELSE ${tasks.netValue} END)`
    })
        .from(projects)
        .leftJoin(tasks, eq(projects.id, tasks.projectId))
        .where(and(eq(projects.isArchived, false), not(eq(projects.status, 'Completado'))))
        .groupBy(projects.id)
        .all();

    // --- F29 CURRENT MONTH CALCULATION ---
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthLike = `${currentMonth}%`;

    // Fetch components for F29 of the current month
    const f29Components = await Promise.all([
        // Sales (Invoices)
        db.select({ amount: sql<number>`SUM(${tasks.taxValue})` })
            .from(tasks)
            .where(and(eq(tasks.documentId, 42), like(tasks.startDate, monthLike), sql`${tasks.netValue} > 0`))
            .get(),
        // Purchases (Invoices)
        db.select({ amount: sql<number>`SUM(${tasks.taxValue})` })
            .from(tasks)
            .where(and(eq(tasks.documentId, 42), like(tasks.startDate, monthLike), sql`${tasks.netValue} < 0`))
            .get(),
        // Honorarios (Retentions)
        db.select({ amount: sql<number>`SUM(${tasks.taxValue})` })
            .from(tasks)
            .where(and(eq(tasks.documentId, 44), like(tasks.startDate, monthLike)))
            .get(),
        // PPM Payments
        db.select({ amount: sql<number>`SUM(${tasks.totalValue})` })
            .from(tasks)
            .leftJoin(movements, eq(tasks.movementId, movements.id))
            .where(and(eq(movements.name, "Pago PPM"), like(tasks.startDate, monthLike)))
            .get()
    ]);

    const f29Debit = f29Components[0]?.amount || 0;
    const f29Credit = Math.abs(f29Components[1]?.amount || 0);
    const f29Retentions = Math.abs(f29Components[2]?.amount || 0);
    const f29Ppm = Math.abs(f29Components[3]?.amount || 0);

    const f29VatPayable = Math.max(0, f29Debit - f29Credit);
    const totalF29 = f29VatPayable + f29Retentions + f29Ppm;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    const totals = reportData.reduce((acc: any, row: any) => ({
        expectedIncome: acc.expectedIncome + (row.expectedIncome || 0),
        realIncomeNet: acc.realIncomeNet + (row.realIncomeNet || 0),
        expensesNet: acc.expensesNet + (row.expensesNet || 0),
        totalTax: acc.totalTax + (row.totalTax || 0),
        balance: acc.balance + (row.balance || 0),
    }), { expectedIncome: 0, realIncomeNet: 0, expensesNet: 0, totalTax: 0, balance: 0 });

    const totalConsolidated = totals.balance + totalF29;

    const exportColumns = [
        { header: 'Proyecto', key: 'name' },
        { header: 'Esperado', key: 'expectedIncome', format: 'currency' as const },
        { header: 'Real (Neto)', key: 'realIncomeNet', format: 'currency' as const },
        { header: 'Gastos (Neto)', key: 'expensesNet', format: 'currency' as const },
        { header: 'Saldo Neto', key: 'balance', format: 'currency' as const },
    ];

    const exportSummary = [
        { label: 'Total Saldo Neto Proyectos', value: formatCurrency(totals.balance) },
        { label: 'Total F29 Mes Actual', value: formatCurrency(totalF29) },
        { label: 'Total Consolidado (Saldo + F29)', value: formatCurrency(totalConsolidated) }
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
                        data={reportData}
                        columns={exportColumns}
                        fileName="balance_proyectos"
                        title="Balance de Proyectos"
                        summary={exportSummary}
                    />
                </div>
            </div>

            <header>
                <h2 className="text-xl md:text-3xl font-bold text-white">Balance de Proyectos</h2>
                <p className="text-sm md:text-base text-slate-400">Comparativa financiera de proyectos activos (v2.1)</p>
            </header>

            {/* Balance Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Link href="/projects" className="glass-card p-4 md:p-6 flex flex-col justify-between hover:bg-white/5 transition-colors group cursor-pointer">
                    <div>
                        <p className="text-[10px] md:text-xs font-bold text-sky-400 uppercase tracking-widest mb-1 group-hover:text-sky-300">Total Saldo Neto</p>
                        <p className="text-xl md:text-2xl font-black text-white">{formatCurrency(totals.balance)}</p>
                    </div>
                </Link>
                <Link href="/reports/f29" className="glass-card p-4 md:p-6 flex flex-col justify-between border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors group cursor-pointer">
                    <div>
                        <p className="text-[10px] md:text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 group-hover:text-amber-300">Total Formulario 29</p>
                        <p className="text-xl md:text-2xl font-black text-white">{formatCurrency(totalF29)}</p>
                    </div>
                    <p className="text-[10px] md:text-xs text-amber-500/60 mt-2 italic">Estimación mes actual</p>
                </Link>
                <div className="glass-card p-4 md:p-6 flex flex-col justify-between border-emerald-500/20 bg-emerald-500/5">
                    <div>
                        <p className="text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Total Consolidado</p>
                        <p className="text-xl md:text-2xl font-black text-white">{formatCurrency(totalConsolidated)}</p>
                    </div>
                    <p className="text-[10px] md:text-xs text-emerald-500/60 mt-2 font-bold select-none whitespace-nowrap">Saldo Neto + F29</p>
                </div>
            </section>

            <section className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/5 bg-white/5">
                                <th className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">Proyecto</th>
                                <th className="px-3 py-3 md:px-6 md:py-4 text-right whitespace-nowrap">Esperado</th>
                                <th className="px-3 py-3 md:px-6 md:py-4 text-right whitespace-nowrap">Real (Neto)</th>
                                <th className="px-3 py-3 md:px-6 md:py-4 text-right whitespace-nowrap">Gastos (Neto)</th>
                                {/* Removed VAT Header */}
                                <th className="px-3 py-3 md:px-6 md:py-4 text-right whitespace-nowrap">Saldo Neto</th>
                                <th className="px-3 py-3 md:px-6 md:py-4 text-right whitespace-nowrap">Cumplimiento</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {reportData.map((row: any, i: number) => {
                                const perc = row.expectedIncome ? (row.realIncomeNet / row.expectedIncome) * 100 : 0;
                                return (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-white font-medium whitespace-nowrap">{row.name}</td>
                                        <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-right text-slate-400 whitespace-nowrap">{formatCurrency(row.expectedIncome || 0)}</td>
                                        <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-right text-emerald-400 font-bold whitespace-nowrap">{formatCurrency(row.realIncomeNet)}</td>
                                        <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-right text-rose-400 font-bold whitespace-nowrap">{formatCurrency(row.expensesNet)}</td>
                                        {/* Removed VAT Cell */}
                                        <td className={`px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-right font-bold whitespace-nowrap ${row.balance >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>
                                            {formatCurrency(row.balance)}
                                        </td>
                                        <td className="px-3 py-3 md:px-6 md:py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-16 md:w-24 bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                    <div className={`h-full ${perc >= 100 ? 'bg-emerald-500' : 'bg-sky-500'}`} style={{ width: `${Math.min(perc, 100)}%` }}></div>
                                                </div>
                                                <span className="text-[10px] md:text-xs font-bold text-slate-500">{perc.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="bg-white/5 border-t border-white/10 font-bold">
                                <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-white uppercase tracking-wider">Totales</td>
                                <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-right text-slate-300 whitespace-nowrap">{formatCurrency(totals.expectedIncome)}</td>
                                <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-right text-emerald-400 whitespace-nowrap">{formatCurrency(totals.realIncomeNet)}</td>
                                <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-right text-rose-400 whitespace-nowrap">{formatCurrency(totals.expensesNet)}</td>
                                {/* Removed VAT Footer */}
                                <td className={`px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-right whitespace-nowrap ${totals.balance >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>
                                    {formatCurrency(totals.balance)}
                                </td>
                                <td className="px-3 py-3 md:px-6 md:py-4"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </section>
        </div>
    );
}
