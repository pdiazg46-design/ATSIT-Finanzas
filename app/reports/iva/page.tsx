import { getIvaReportData, IvaItem } from '@/lib/report-actions';
import { db } from '@/lib/db';
import { vatPayments } from '@/lib/schema';
import { ArrowLeft, Wallet } from 'lucide-react';
import Link from 'next/link';
import ExportButtons from '@/components/ExportButtons';

export default async function IVAReportPage() {
    const rawData = await getIvaReportData();

    // Fetch payments
    const payments = await db.select().from(vatPayments);

    // Grouping Logic
    const groupedByMonth: Record<string, { debito: IvaItem[], credito: IvaItem[], pagos: typeof payments }> = {};

    rawData.forEach((item: any) => {
        if (!item.date) return;
        const dateObj = new Date(item.date);
        const monthKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;

        if (!groupedByMonth[monthKey]) {
            groupedByMonth[monthKey] = { debito: [], credito: [], pagos: [] };
        }

        if (item.movementType === 'Ingreso') {
            groupedByMonth[monthKey].debito.push(item);
        } else {
            groupedByMonth[monthKey].credito.push(item);
        }
    });

    // Group payments
    payments.forEach((p: any) => {
        const dateObj = new Date(p.paymentDate);
        const monthKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;

        if (!groupedByMonth[monthKey]) {
            groupedByMonth[monthKey] = { debito: [], credito: [], pagos: [] };
        }
        groupedByMonth[monthKey].pagos.push(p);
    });

    // Sort months descending
    const sortedMonths = Object.keys(groupedByMonth).sort().reverse();

    const formatCurrency = (val: number | null) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    const formatMonthName = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
    };

    const calculateTotalIva = (items: IvaItem[]) => items.reduce((acc: any, curr: any) => acc + (curr.taxValue || 0), 0);

    // Calculate Global Totals for Summary
    const globalDebito = rawData.filter((i: any) => i.movementType === 'Ingreso').reduce((acc: any, curr: any) => acc + (curr.taxValue || 0), 0);
    const globalCredito = rawData.filter((i: any) => i.movementType !== 'Ingreso').reduce((acc: any, curr: any) => acc + (curr.taxValue || 0), 0);
    const globalPagado = payments.reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const globalBalance = globalDebito + globalCredito - globalPagado; // If positive, payable. If negative, credit.

    // Prepare Export Data (Flat List)
    const exportData = [
        ...rawData.map((item: any) => ({
            date: item.date,
            project: item.projectName || 'Sin Proyecto',
            type: item.movementType === 'Ingreso' ? 'Venta (IVA Débito)' : 'Compra (IVA Crédito)',
            doc: `${item.documentName} #${item.docNumber || '-'}`,
            net: item.netValue,
            tax: item.taxValue,
            total: (item.netValue || 0) + (item.taxValue || 0)
        })),
        ...payments.map((p: any) => ({
            date: p.paymentDate,
            project: 'Tesoreria',
            type: 'Pago IVA',
            doc: 'Comprobante',
            net: 0,
            tax: 0,
            total: p.amount
        }))
    ].sort((a: any, b: any) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());

    const exportColumns = [
        { header: 'Fecha', key: 'date' },
        { header: 'Proyecto', key: 'project' },
        { header: 'Tipo', key: 'type' },
        { header: 'Documento', key: 'doc' },
        { header: 'Neto', key: 'net', format: 'currency' as const },
        { header: 'IVA', key: 'tax', format: 'currency' as const },
        { header: 'Total', key: 'total', format: 'currency' as const },
    ];

    const exportSummary = [
        { label: 'Total IVA Débito (Ventas)', value: formatCurrency(globalDebito) },
        { label: 'Total IVA Crédito (Compras)', value: formatCurrency(globalCredito) },
        { label: 'Total IVA Pagado', value: formatCurrency(globalPagado) },
        { label: 'IVA por Pagar (Actual)', value: formatCurrency(globalBalance) }
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <Link href="/reports" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    Volver a Informes
                </Link>
                <div className="flex gap-2">
                    <ExportButtons
                        data={exportData}
                        columns={exportColumns}
                        fileName="informe_iva"
                        title="Informe de IVA (Débitos, Créditos y Pagos)"
                        summary={exportSummary}
                    />
                </div>
            </div>

            <header>
                <h2 className="text-xl md:text-3xl font-bold text-white">Resumen Mensual de IVA</h2>
                <p className="text-sm md:text-base text-slate-400">Detalle de Créditos y Débitos fiscales agrupados por mes</p>
            </header>

            {sortedMonths.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-2xl">
                    <p className="text-slate-400">No hay movimientos de IVA registrados aún.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {sortedMonths.map((monthKey: string) => {
                        const monthData = groupedByMonth[monthKey];
                        const totalDebito = calculateTotalIva(monthData.debito);
                        const totalCredito = calculateTotalIva(monthData.credito);
                        const totalPagado = monthData.pagos.reduce((acc: number, curr: any) => acc + curr.amount, 0);

                        const balance = totalDebito + totalCredito - totalPagado;

                        return (
                            <section key={monthKey} className="space-y-6">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-4 gap-2 md:gap-0">
                                    <h3 className="text-xl md:text-2xl font-bold text-indigo-400 capitalize">{formatMonthName(monthKey)}</h3>
                                    <div className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-xl font-bold ${balance >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                        Balance IVA: {formatCurrency(balance)} {balance > 0 ? '(Pagar)' : '(Remanente)'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {/* IVA DEBITO (VENTAS) */}
                                    <div className="glass-card p-4 md:p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-base md:text-lg font-bold text-emerald-400">IVA Débito (Ventas)</h4>
                                            <span className="text-white font-mono font-bold text-sm md:text-base">{formatCurrency(totalDebito)}</span>
                                        </div>
                                        {monthData.debito.length === 0 ? (
                                            <p className="text-sm text-slate-500 italic">Sin movimientos.</p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead>
                                                        <tr className="text-[10px] md:text-xs text-slate-500 border-b border-white/10">
                                                            <th className="py-2 whitespace-nowrap">Fecha</th>
                                                            <th className="py-2 whitespace-nowrap">Doc/N°</th>
                                                            <th className="py-2 text-right whitespace-nowrap">Neto</th>
                                                            <th className="py-2 text-right whitespace-nowrap">IVA</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {monthData.debito.map((item: any) => (
                                                            <tr key={item.id}>
                                                                <td className="py-2 text-slate-300 text-xs md:text-sm whitespace-nowrap">{item.date}</td>
                                                                <td className="py-2 text-slate-300 text-xs md:text-sm">
                                                                    <div className="flex flex-col">
                                                                        <span className="truncate max-w-[120px] md:max-w-none">{item.documentName}</span>
                                                                        <span className="text-[10px] md:text-xs text-slate-500">#{item.docNumber || '-'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-2 text-right text-slate-400 text-xs md:text-sm whitespace-nowrap">{formatCurrency(item.netValue)}</td>
                                                                <td className="py-2 text-right text-emerald-400 font-medium text-xs md:text-sm whitespace-nowrap">{formatCurrency(item.taxValue)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    {/* IVA CREDITO (COMPRAS) */}
                                    <div className="glass-card p-4 md:p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-base md:text-lg font-bold text-amber-400">IVA Crédito (Compras)</h4>
                                            <span className="text-white font-mono font-bold text-sm md:text-base">{formatCurrency(totalCredito)}</span>
                                        </div>
                                        {monthData.credito.length === 0 ? (
                                            <p className="text-sm text-slate-500 italic">Sin movimientos.</p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead>
                                                        <tr className="text-[10px] md:text-xs text-slate-500 border-b border-white/10">
                                                            <th className="py-2 whitespace-nowrap">Fecha</th>
                                                            <th className="py-2 whitespace-nowrap">Doc/N°</th>
                                                            <th className="py-2 text-right whitespace-nowrap">Neto</th>
                                                            <th className="py-2 text-right whitespace-nowrap">IVA</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {monthData.credito.map((item: any) => (
                                                            <tr key={item.id}>
                                                                <td className="py-2 text-slate-300 text-xs md:text-sm whitespace-nowrap">{item.date}</td>
                                                                <td className="py-2 text-slate-300 text-xs md:text-sm">
                                                                    <div className="flex flex-col">
                                                                        <span className="truncate max-w-[120px] md:max-w-none">{item.documentName}</span>
                                                                        <span className="text-[10px] md:text-xs text-slate-500">#{item.docNumber || '-'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-2 text-right text-slate-400 text-xs md:text-sm whitespace-nowrap">{formatCurrency(item.netValue)}</td>
                                                                <td className="py-2 text-right text-amber-400 font-medium text-xs md:text-sm whitespace-nowrap">{formatCurrency(item.taxValue)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    {/* PAGOS REALIZADOS */}
                                    <div className="glass-card p-4 md:p-6 xl:col-span-2 border-sky-500/10 bg-sky-500/5">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-2">
                                                <Wallet size={20} className="text-sky-400" />
                                                <h4 className="text-base md:text-lg font-bold text-sky-400">Pagos de IVA Realizados</h4>
                                            </div>
                                            <span className="text-white font-mono font-bold text-sm md:text-base">{formatCurrency(totalPagado)}</span>
                                        </div>
                                        {monthData.pagos.length === 0 ? (
                                            <p className="text-sm text-slate-500 italic">No se registraron pagos este mes.</p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead>
                                                        <tr className="text-[10px] md:text-xs text-slate-500 border-b border-white/10">
                                                            <th className="py-2 whitespace-nowrap">Fecha</th>
                                                            <th className="py-2">Observaciones</th>
                                                            <th className="py-2 text-right whitespace-nowrap">Monto</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {monthData.pagos.map((item: any) => (
                                                            <tr key={item.id}>
                                                                <td className="py-2 text-slate-300 text-xs md:text-sm whitespace-nowrap">{item.paymentDate}</td>
                                                                <td className="py-2 text-slate-400 text-xs md:text-sm truncate max-w-[200px] md:max-w-none">{item.notes || '-'}</td>
                                                                <td className="py-2 text-right text-sky-400 font-medium text-xs md:text-sm whitespace-nowrap">{formatCurrency(item.amount)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
