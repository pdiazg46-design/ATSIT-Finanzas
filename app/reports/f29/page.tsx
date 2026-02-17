import { db } from '@/lib/db';
import { tasks, documents, projects, movements } from '@/lib/schema';
import { eq, sql, and, like, desc } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MonthFilter from '@/components/MonthFilter';
import ExportButtons from '@/components/ExportButtons';

export default async function F29ReportPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
    const { month } = await searchParams;
    const currentMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM

    // --- QUERY LOGIC ---
    // We need to filter tasks by the selected month.
    // The relevant date field depends on the context:
    // - For F29, usually 'paymentDate' (when the money moved) or 'date' (accrual) is used.
    // - Let's use 'startDate' (as Document Date) for now, as taxes are usually declared based on the emission date.

    const monthLike = `${currentMonth}%`;

    // 1. VENTAS (Ingresos afectos a IVA) - Factura Electrónica (ID 42)
    const salesData = await db.select({
        id: tasks.id,
        title: tasks.title,
        docNumber: tasks.docNumber,
        netValue: tasks.netValue,
        taxValue: tasks.taxValue,
        projectName: projects.name, // Add Project Name
        totalValue: tasks.totalValue
    })
        .from(tasks)
        .leftJoin(documents, eq(tasks.documentId, documents.id))
        .leftJoin(projects, eq(tasks.projectId, projects.id)) // Join Projects
        .where(
            and(
                eq(tasks.documentId, 42), // Factura Electrónica
                like(tasks.startDate, monthLike), // In this month
                sql`${tasks.netValue} > 0` // Positive value = Income (Venta)
            )
        ).all();

    // 2. COMPRAS (Gastos afectos a IVA) - Factura Electrónica (ID 42)
    const purchasesData = await db.select({
        id: tasks.id,
        title: tasks.title,
        docNumber: tasks.docNumber,
        netValue: tasks.netValue,
        taxValue: tasks.taxValue,
        projectName: projects.name, // Add Project Name
        totalValue: tasks.totalValue
    })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id)) // Join Projects
        .where(
            and(
                eq(tasks.documentId, 42), // Factura Electrónica
                like(tasks.startDate, monthLike),
                sql`${tasks.netValue} < 0` // Negative value = Expense (Compra)
            )
        ).all();

    // 3. HONORARIOS (Retenciones) - Boleta Honorarios (ID 44)
    const honorariumData = await db.select({
        id: tasks.id,
        title: tasks.title,
        docNumber: tasks.docNumber,
        netValue: tasks.netValue, // Líquido
        taxValue: tasks.taxValue, // Retención
        projectName: projects.name, // Add Project Name
        totalValue: tasks.totalValue
    })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id)) // Join Projects
        .where(
            and(
                eq(tasks.documentId, 44), // Boleta Honorarios
                like(tasks.startDate, monthLike)
            )
        ).all();

    // 4. ADELANTO PPM (Credito contra Renta) - Adelanto PPM
    const ppmPrepaidData = await db.select({
        id: tasks.id,
        title: tasks.title,
        docNumber: tasks.docNumber,
        netValue: tasks.netValue,
        taxValue: tasks.taxValue,
        projectName: projects.name,
        totalValue: tasks.totalValue
    })
        .from(tasks)
        .leftJoin(movements, eq(tasks.movementId, movements.id))
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .where(
            and(
                eq(movements.name, "Pago PPM (Gasto)"),
                like(tasks.startDate, monthLike)
            )
        ).all();

    // --- CALCULATIONS ---
    const totalDebit = salesData.reduce((acc, t) => acc + (t.taxValue || 0), 0);
    const totalCredit = Math.abs(purchasesData.reduce((acc, t) => acc + (t.taxValue || 0), 0));
    const totalWithholding = Math.abs(honorariumData.reduce((acc, t) => acc + (t.taxValue || 0), 0));
    const totalPpmPrepaid = Math.abs(ppmPrepaidData.reduce((acc, t) => acc + (t.totalValue || 0), 0));

    // NET INCOME (Not used for automatic PPM now, but kept for reference if needed)
    const totalNetSales = salesData.reduce((acc, t) => acc + (t.netValue || 0), 0);

    // F29 RESULT
    // Payable = (Debit - Credit) + Withholdings + PPM Determined - PPM Prepaid
    // If Credit > Debit, Remnant remains.
    const vatPayable = Math.max(0, totalDebit - totalCredit);
    const totalPayable = vatPayable + totalWithholding + totalPpmPrepaid;

    const vatCreditRemnant = Math.max(0, totalCredit - totalDebit);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    // --- DATA EXPORT ---
    // Prepare a combined list for export or utilize summary
    const exportSummary = [
        { label: 'Débito Fiscal (IVA Ventas)', value: formatCurrency(totalDebit) },
        { label: 'Crédito Fiscal (IVA Compras)', value: formatCurrency(totalCredit) },
        { label: 'Impuesto a Pagar (IVA)', value: formatCurrency(vatPayable) },
        { label: 'Retención Honorarios (15.25%)', value: formatCurrency(totalWithholding) },
        { label: 'Pago PPM (Registrado)', value: formatCurrency(totalPpmPrepaid) },
        { label: 'TOTAL A PAGAR F29', value: formatCurrency(totalPayable) },
    ];


    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <Link href="/reports" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    Volver a Informes
                </Link>
                <div className="flex gap-3">
                    <MonthFilter />
                    <ExportButtons
                        data={[]} // We don't have a single flattened list, so maybe just export summary?
                        columns={[]}
                        fileName={`f29_${currentMonth}`}
                        title={`Informe F29 - ${currentMonth}`}
                        summary={exportSummary}
                    />
                </div>
            </div>

            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold text-white">Simulación F29</h2>
                        <p className="text-sm md:text-base text-slate-400">Declaración Mensual de Impuestos ({currentMonth})</p>
                    </div>
                </div>
            </header>

            {/* F29 DASHBOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COL 1: IVA DETERMINATION */}
                <section className="glass-card p-0 overflow-hidden flex flex-col h-full">
                    <div className="p-4 border-b border-white/5 bg-white/5 font-bold text-slate-300">
                        1. Determinación del IVA
                    </div>
                    <div className="p-6 space-y-4 flex-1">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Débito Fiscal (+)</span>
                            <span className="font-bold text-white">{formatCurrency(totalDebit)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Crédito Fiscal (-)</span>
                            <span className="font-bold text-rose-400">({formatCurrency(totalCredit)})</span>
                        </div>
                        <div className="h-px bg-white/10 my-2"></div>
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-bold text-sky-400">Impuesto Determinado</span>
                            <span className={`font-black ${vatPayable > 0 ? 'text-white' : 'text-slate-500'}`}>
                                {formatCurrency(vatPayable)}
                            </span>
                        </div>
                        {vatCreditRemnant > 0 && (
                            <div className="mt-2 text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded">
                                Remanente para próximo mes: {formatCurrency(vatCreditRemnant)}
                            </div>
                        )}
                    </div>
                </section>

                {/* COL 2: INCOME TAX & WITHHOLDINGS */}
                <section className="glass-card p-0 overflow-hidden flex flex-col h-full">
                    <div className="p-4 border-b border-white/5 bg-white/5 font-bold text-slate-300">
                        2. Renta y Retenciones
                    </div>
                    <div className="p-6 space-y-4 flex-1">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-sm text-slate-400">Retención 2da Cat. (+)</span>
                                <span className="text-[10px] text-slate-500">Tasa 15.25%</span>
                            </div>
                            <span className="font-bold text-white">{formatCurrency(totalWithholding)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-sm text-slate-400">Pago PPM (+)</span>
                                <span className="text-[10px] text-slate-500">Monto registrado manualmente</span>
                            </div>
                            <span className="font-bold text-white">{formatCurrency(totalPpmPrepaid)}</span>
                        </div>
                    </div>
                </section>

                {/* COL 3: TOTAL PAYABLE */}
                <section className="glass-card p-0 overflow-hidden flex flex-col h-full border-orange-500/30 bg-orange-500/5">
                    <div className="p-4 border-b border-orange-500/20 bg-orange-500/20 font-bold text-orange-200">
                        3. Total a Pagar
                    </div>
                    <div className="p-6 flex flex-col justify-center items-center flex-1 text-center">
                        <p className="text-sm text-orange-300/60 uppercase tracking-widest mb-2 font-bold">Total Formulario 29</p>
                        <p className="text-4xl font-black text-white drop-shadow-lg">{formatCurrency(totalPayable)}</p>
                        <p className="text-xs text-slate-400 mt-4 max-w-[200px]">
                            Este monto debe ser pagado antes del día 20 del mes siguiente.
                        </p>
                    </div>
                </section>
            </div>

            {/* DETAILED TABLES (CONDITIONAL) */}

            {salesData.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Detalle Ventas (Débito)</h3>
                    <div className="glass-card overflow-x-auto p-0">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-slate-400">
                                <tr>
                                    <th className="p-3">Doc</th>
                                    <th className="p-3">Proyecto</th>
                                    <th className="p-3">Concepto</th>
                                    <th className="p-3 text-right">Neto</th>
                                    <th className="p-3 text-right">IVA</th>
                                    <th className="p-3 text-right">Total Bruto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {salesData.map(t => (
                                    <tr key={t.id}>
                                        <td className="p-3 text-slate-300">#{t.docNumber}</td>
                                        <td className="p-3 text-sky-400 font-bold">{t.projectName}</td>
                                        <td className="p-3 text-white">{t.title}</td>
                                        <td className="p-3 text-right text-slate-400">{formatCurrency(t.netValue || 0)}</td>
                                        <td className="p-3 text-right text-emerald-400 font-bold">{formatCurrency(t.taxValue || 0)}</td>
                                        <td className="p-3 text-right text-white font-bold">{formatCurrency(t.totalValue || 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-white/20 bg-white/5">
                                    <td colSpan={3} className="p-3 text-xs font-bold text-slate-400">TOTALES</td>
                                    <td className="p-3 text-right text-xs font-bold text-slate-300">{formatCurrency(salesData.reduce((acc, t) => acc + (t.netValue || 0), 0))}</td>
                                    <td className="p-3 text-right text-xs font-bold text-emerald-400">{formatCurrency(totalDebit)}</td>
                                    <td className="p-3 text-right text-xs font-bold text-white">{formatCurrency(salesData.reduce((acc, t) => acc + (t.totalValue || 0), 0))}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>
            )}

            {purchasesData.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Detalle Compras (Crédito)</h3>
                    <div className="glass-card overflow-x-auto p-0">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-slate-400">
                                <tr>
                                    <th className="p-3">Doc</th>
                                    <th className="p-3">Proyecto</th>
                                    <th className="p-3">Concepto</th>
                                    <th className="p-3 text-right">Neto</th>
                                    <th className="p-3 text-right">IVA</th>
                                    <th className="p-3 text-right">Total Bruto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {purchasesData.map(t => (
                                    <tr key={t.id}>
                                        <td className="p-3 text-slate-300">#{t.docNumber}</td>
                                        <td className="p-3 text-sky-400 font-bold">{t.projectName}</td>
                                        <td className="p-3 text-white">{t.title}</td>
                                        <td className="p-3 text-right text-slate-400">{formatCurrency(Math.abs(t.netValue || 0))}</td>
                                        <td className="p-3 text-right text-rose-400 font-bold">{formatCurrency(Math.abs(t.taxValue || 0))}</td>
                                        <td className="p-3 text-right text-white font-bold">{formatCurrency(Math.abs(t.totalValue || 0))}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-white/20 bg-white/5">
                                    <td colSpan={3} className="p-3 text-xs font-bold text-slate-400">TOTALES</td>
                                    <td className="p-3 text-right text-xs font-bold text-slate-300">{formatCurrency(Math.abs(purchasesData.reduce((acc, t) => acc + (t.netValue || 0), 0)))}</td>
                                    <td className="p-3 text-right text-xs font-bold text-rose-400">{formatCurrency(totalCredit)}</td>
                                    <td className="p-3 text-right text-xs font-bold text-white">{formatCurrency(Math.abs(purchasesData.reduce((acc, t) => acc + (t.totalValue || 0), 0)))}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>
            )}

            {honorariumData.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Detalle Honorarios (Retención)</h3>
                    <div className="glass-card overflow-x-auto p-0">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-slate-400">
                                <tr>
                                    <th className="p-3">Doc</th>
                                    <th className="p-3">Proyecto</th>
                                    <th className="p-3">Concepto</th>
                                    <th className="p-3 text-right">Líquido</th>
                                    <th className="p-3 text-right">Retención</th>
                                    <th className="p-3 text-right">Total Bruto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {honorariumData.map(t => (
                                    <tr key={t.id}>
                                        <td className="p-3 text-slate-300">#{t.docNumber}</td>
                                        <td className="p-3 text-sky-400 font-bold">{t.projectName}</td>
                                        <td className="p-3 text-white">{t.title}</td>
                                        <td className="p-3 text-right text-slate-400">{formatCurrency(Math.abs(t.netValue || 0))}</td>
                                        <td className="p-3 text-right text-purple-400 font-bold">{formatCurrency(Math.abs(t.taxValue || 0))}</td>
                                        <td className="p-3 text-right text-white font-bold">{formatCurrency(Math.abs(t.totalValue || 0))}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-white/20 bg-white/5">
                                    <td colSpan={3} className="p-3 text-xs font-bold text-slate-400">TOTALES</td>
                                    <td className="p-3 text-right text-xs font-bold text-slate-300">{formatCurrency(Math.abs(honorariumData.reduce((acc, t) => acc + (t.netValue || 0), 0)))}</td>
                                    <td className="p-3 text-right text-xs font-bold text-purple-400">{formatCurrency(totalWithholding)}</td>
                                    <td className="p-3 text-right text-xs font-bold text-white">{formatCurrency(Math.abs(honorariumData.reduce((acc, t) => acc + (t.totalValue || 0), 0)))}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>
            )}

            {ppmPrepaidData.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-3">Detalle PPM Pagado (Adelantos)</h3>
                    <div className="glass-card overflow-x-auto p-0 border-emerald-500/20 bg-emerald-500/5">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-slate-400">
                                <tr>
                                    <th className="p-3">Doc</th>
                                    <th className="p-3">Proyecto</th>
                                    <th className="p-3">Concepto</th>
                                    <th className="p-3 text-right">Monto Pagado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {ppmPrepaidData.map(t => (
                                    <tr key={t.id}>
                                        <td className="p-3 text-slate-300">#{t.docNumber || 'S/N'}</td>
                                        <td className="p-3 text-sky-400 font-bold">{t.projectName}</td>
                                        <td className="p-3 text-white">{t.title}</td>
                                        <td className="p-3 text-right text-emerald-400 font-bold">{formatCurrency(Math.abs(t.totalValue || 0))}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-white/20 bg-white/5">
                                    <td colSpan={3} className="p-3 text-xs font-bold text-slate-400">TOTALES</td>
                                    <td className="p-3 text-right text-xs font-bold text-emerald-400">{formatCurrency(totalPpmPrepaid)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>
            )}

        </div>
    );
}
