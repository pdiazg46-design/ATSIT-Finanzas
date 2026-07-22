import { db } from '@/lib/db';
import { projects, tasks, employees } from '@/lib/schema';
import { eq, sql, and, desc } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ExportButtons from '@/components/ExportButtons';

export default async function HonorariosReportPage() {
    // Fetch all tasks that are "Boleta Honorarios" (ID 44)
    // We group by project to show the breakdown
    const reportData = await db.select({
        id: tasks.id,
        projectId: projects.id,
        projectName: projects.name,
        docNumber: tasks.docNumber,
        title: tasks.title,
        netValue: tasks.netValue, // This is the Liquid Amount
        taxValue: tasks.taxValue, // This is the 15.25% Retention
        totalValue: tasks.totalValue   // Total Bruto
    })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .where(
            and(
                eq(tasks.documentId, 44), // Boleta Honorarios
                eq(projects.isArchived, false) // Active projects only
            )
        )
        .orderBy(projects.name, desc(tasks.startDate))
        .all();

    // Calculate Global Totals
    // Calculate Global Totals
    const totals = reportData.reduce((acc, row) => ({
        net: acc.net + (row.netValue || 0),
        retention: acc.retention + (row.taxValue || 0),
        gross: acc.gross + (row.totalValue || 0),
        count: acc.count + 1
    }), { net: 0, retention: 0, gross: 0, count: 0 });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    const exportColumns = [
        { header: 'Proyecto', key: 'projectName' },
        { header: 'N° Doc', key: 'docNumber' },
        { header: 'Concepto', key: 'title' },
        { header: 'Líquido', key: 'netValue', format: 'currency' as const },
        { header: 'Retención (15.25%)', key: 'taxValue', format: 'currency' as const },
        { header: 'Total Bruto', key: 'totalValue', format: 'currency' as const },
    ];

    const exportSummary = [
        { label: 'Total Líquido Pagado', value: formatCurrency(totals.net) },
        { label: 'Total Retención a Pagar (F29)', value: formatCurrency(totals.retention) },
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
                        fileName="informe_honorarios"
                        title="Informe de Honorarios y Retenciones"
                        summary={exportSummary}
                    />
                </div>
            </div>

            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold text-white">Informe de Honorarios</h2>
                        <p className="text-sm md:text-base text-slate-400">Detalle de retenciones de 2da Categoría por proyecto</p>
                    </div>
                </div>
            </header>

            {/* Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="glass-card p-4 md:p-6 flex flex-col justify-between border-purple-500/20 bg-purple-500/5">
                    <div>
                        <p className="text-[10px] md:text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Retención Total (F29)</p>
                        <p className="text-2xl md:text-3xl font-black text-white">{formatCurrency(totals.retention)}</p>
                    </div>
                    <p className="text-[10px] md:text-xs text-purple-500/60 mt-2">Monto a declarar y pagar al SII</p>
                </div>
                <div className="glass-card p-4 md:p-6 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Líquido Pagado</p>
                        <p className="text-xl md:text-2xl font-black text-slate-300">{formatCurrency(totals.net)}</p>
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-2">Monto efectivamente transferido a profesionales</p>
                </div>
            </section>

            <section className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/5 bg-white/5">
                                <th className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">Proyecto</th>
                                <th className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">N° Doc</th>
                                <th className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">Concepto</th>
                                <th className="px-3 py-3 md:px-6 md:py-4 text-right whitespace-nowrap">Líquido</th>
                                <th className="px-3 py-3 md:px-6 md:py-4 text-right whitespace-nowrap text-purple-400">Retención</th>
                                <th className="px-3 py-3 md:px-6 md:py-4 text-right whitespace-nowrap">Total Bruto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {reportData.map((row: any, i: number) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm font-bold whitespace-nowrap">
                                        <Link href={`/projects/${row.projectId}`} className="text-sky-400 hover:text-sky-300 hover:underline transition-colors">
                                            {row.projectName}
                                        </Link>
                                    </td>
                                    <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-slate-400 whitespace-nowrap">#{row.docNumber}</td>
                                    <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-white whitespace-nowrap">{row.title}</td>
                                    <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-right text-slate-300 whitespace-nowrap">{formatCurrency(row.netValue)}</td>
                                    <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-right text-purple-400 font-bold whitespace-nowrap">{formatCurrency(row.taxValue)}</td>
                                    <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-right text-emerald-400 font-bold whitespace-nowrap">{formatCurrency(row.totalValue)}</td>
                                </tr>
                            ))}
                            {reportData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">
                                        No se encontraron boletas de honorarios registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {reportData.length > 0 && (
                            <tfoot>
                                <tr className="bg-white/5 border-t border-white/10 font-bold">
                                    <td colSpan={3} className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-white uppercase tracking-wider text-right">Totales Globales:</td>
                                    <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-right text-slate-300">{formatCurrency(totals.net)}</td>
                                    <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-right text-purple-400">{formatCurrency(totals.retention)}</td>
                                    <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-right text-emerald-400">{formatCurrency(totals.gross)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </section>
        </div>
    );
}
