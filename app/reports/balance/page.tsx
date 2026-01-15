import { db } from '@/lib/db';
import { projects, tasks, vatPayments } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ExportButtons from '@/components/ExportButtons';

export default async function BalanceReportPage() {
    const reportData = await db.select({
        name: projects.name,
        expectedIncome: projects.expectedIncome,
        realIncomeNet: sql<number>`SUM(CASE WHEN ${tasks.netValue} > 0 THEN ${tasks.netValue} ELSE 0 END)`,
        expensesNet: sql<number>`SUM(CASE WHEN ${tasks.netValue} < 0 THEN ABS(${tasks.netValue}) ELSE 0 END)`,
        totalTax: sql<number>`SUM(${tasks.taxValue})`,
        balance: sql<number>`SUM(${tasks.netValue})`
    })
        .from(projects)
        .leftJoin(tasks, eq(projects.id, tasks.projectId))
        .where(eq(projects.isArchived, false))
        .groupBy(projects.id)
        .all();

    // Calculate Global VAT (Payable)
    // We need total tax from ALL tasks (not just project-linked ones, although currently most should be linked)
    // and total VAT payments made.
    const globalTaxParams = await db.select({
        totalTax: sql<number>`SUM(${tasks.taxValue})`
    }).from(tasks);

    const globalPaymentsParams = await db.select({
        totalPaid: sql<number>`SUM(${vatPayments.amount})`
    }).from(vatPayments);

    const globalTax = globalTaxParams[0]?.totalTax || 0;
    const globalPaid = globalPaymentsParams[0]?.totalPaid || 0;
    const ivaPayable = globalTax - globalPaid;

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

    const totalBank = totals.balance + totals.totalTax;

    const exportColumns = [
        { header: 'Proyecto', key: 'name' },
        { header: 'Esperado', key: 'expectedIncome', format: 'currency' as const },
        { header: 'Real (Neto)', key: 'realIncomeNet', format: 'currency' as const },
        { header: 'Gastos (Neto)', key: 'expensesNet', format: 'currency' as const },
        { header: 'Saldo Neto', key: 'balance', format: 'currency' as const },
    ];

    const exportSummary = [
        { label: 'Total Neto en Caja', value: formatCurrency(totals.balance) },
        { label: 'IVA por Pagar (Global)', value: formatCurrency(ivaPayable) },
        { label: 'Total Real Disponible (Banco)', value: formatCurrency(totals.balance + ivaPayable) }
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
                <p className="text-sm md:text-base text-slate-400">Comparativa financiera de proyectos activos (Desglose Neto + IVA)</p>
            </header>

            {/* Bank Summary Card */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="glass-card p-4 md:p-6 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] md:text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">Total Saldo Neto</p>
                        <p className="text-xl md:text-2xl font-black text-white">{formatCurrency(totals.balance)}</p>
                    </div>
                </div>
                {/* Removed VAT Card */}
                <div className="glass-card p-4 md:p-6 flex flex-col justify-between border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
                    {/* Icon can be kept or removed if redundant with export buttons, keeping for UI consistency */}
                    <div>
                        <p className="text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Total en Banco</p>
                        <p className="text-2xl md:text-3xl font-black text-white">{formatCurrency(totalBank)}</p>
                    </div>
                    <p className="text-[10px] md:text-xs text-emerald-500/60 mt-2">Saldo Real Disponible</p>
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
