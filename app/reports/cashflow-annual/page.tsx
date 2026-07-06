import { db } from '@/lib/db';
import { projects, tasks, vatPayments, movements } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { ArrowLeft, TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ExportButtons from '@/components/ExportButtons';
import YearFilter from '@/components/YearFilter';

export default async function CashFlowAnnualPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
    const params = await searchParams;
    const currentYearStr = new Date().getFullYear().toString();
    const selectedYear = params.year || currentYearStr;

    // 1. Fetch Task Movements
    const allMovements = await db.select()
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .leftJoin(movements, eq(tasks.movementId, movements.id))
        .all();

    // 2. Fetch VAT Payments
    const allPayments = await db.select().from(vatPayments).all();

    // 3. Build unique list of years from data to populate the selector
    const yearsSet = new Set<string>();
    yearsSet.add(currentYearStr); // Always offer the current year

    allMovements.forEach((row: any) => {
        const m = row.tasks;
        if (m.startDate) {
            const date = new Date(m.startDate);
            if (!isNaN(date.getTime())) {
                yearsSet.add(date.getFullYear().toString());
            }
        }
    });

    allPayments.forEach((p: any) => {
        if (p.paymentDate) {
            const date = new Date(p.paymentDate);
            if (!isNaN(date.getTime())) {
                yearsSet.add(date.getFullYear().toString());
            }
        }
    });

    const availableYears = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));

    // 4. Initialize 12 months structure for the selected year
    const monthlyFlow: Record<string, { income: number, expense: number }> = {};
    for (let i = 1; i <= 12; i++) {
        const key = `${selectedYear}-${String(i).padStart(2, '0')}`;
        monthlyFlow[key] = { income: 0, expense: 0 };
    }

    // Process Movements - Aggregate by month for the selected year
    allMovements.forEach((row: any) => {
        const m = row.tasks;
        const mov = row.movements;
        if (!m.startDate) return;

        const date = new Date(m.startDate);
        if (isNaN(date.getTime())) return;

        const year = date.getFullYear().toString();
        if (year !== selectedYear) return;

        const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        const val = m.netValue ?? m.totalValue ?? 0;
        const absVal = Math.abs(val);

        let isIncome = false;
        if (mov && mov.type) {
            isIncome = mov.type.toLowerCase() === 'ingreso';
        } else {
            isIncome = val > 0;
        }

        if (!monthlyFlow[monthKey]) {
            monthlyFlow[monthKey] = { income: 0, expense: 0 };
        }

        if (isIncome) {
            monthlyFlow[monthKey].income += absVal;
        } else {
            monthlyFlow[monthKey].expense += absVal;
        }
    });

    // Process VAT Payments - Aggregate by month for the selected year
    allPayments.forEach((p: any) => {
        if (!p.paymentDate) return;

        const date = new Date(p.paymentDate);
        if (isNaN(date.getTime())) return;

        const year = date.getFullYear().toString();
        if (year !== selectedYear) return;

        const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyFlow[monthKey]) {
            monthlyFlow[monthKey] = { income: 0, expense: 0 };
        }

        // VAT payments are always expenses
        monthlyFlow[monthKey].expense += p.amount;
    });

    // Calculate annual aggregates
    let totalAnnualIncome = 0;
    let totalAnnualExpense = 0;

    Object.values(monthlyFlow).forEach(flow => {
        totalAnnualIncome += flow.income;
        totalAnnualExpense += flow.expense;
    });

    const totalAnnualNet = totalAnnualIncome - totalAnnualExpense;

    // 5. Unified List for Detailed Table of the year
    const normalizedMovements = [
        ...allMovements.map((row: any) => {
            const t = row.tasks;
            const p = row.projects;
            const mov = row.movements;
            const val = t.netValue ?? t.totalValue ?? 0;

            let isIncome = false;
            if (mov && mov.type) {
                isIncome = mov.type.toLowerCase() === 'ingreso';
            } else {
                isIncome = val > 0;
            }

            return {
                id: `task-${t.id}`,
                date: t.startDate ? new Date(t.startDate) : null,
                projectName: p?.name || 'Sin Proyecto',
                movementName: mov?.name || 'Sin Especificar',
                title: t.title,
                observations: t.observations,
                amount: val,
                isIncome: isIncome,
                typeLabel: isIncome ? 'Ingreso' : 'Egreso'
            };
        }),
        ...allPayments.map((p: any) => {
            return {
                id: `payment-${p.id}`,
                date: new Date(p.paymentDate),
                projectName: 'Impuestos (SII)',
                movementName: 'Pago IVA',
                title: 'Pago IVA Mensual',
                observations: p.notes,
                amount: -p.amount,
                isIncome: false,
                typeLabel: 'Egreso'
            };
        })
    ].filter((item: any) => {
        if (!item.date) return false;
        return item.date.getFullYear().toString() === selectedYear;
    });

    // Sort Descending (Newest First)
    normalizedMovements.sort((a: any, b: any) => {
        const timeA = a.date ? a.date.getTime() : 0;
        const timeB = b.date ? b.date.getTime() : 0;
        return timeB - timeA;
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    const formatMonthName = (monthKey: string) => {
        const [_, monthStr] = monthKey.split('-');
        const monthNum = parseInt(monthStr, 10);
        const monthsNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return monthsNames[monthNum - 1];
    };

    const formatDate = (date: Date | null) => {
        if (!date || isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('es-CL');
    };

    const exportColumns = [
        { header: 'Fecha', key: 'date', format: 'date' as const },
        { header: 'Proyecto', key: 'projectName' },
        { header: 'Tipo Movimiento', key: 'movementName' },
        { header: 'Concepto/Título', key: 'title' },
        { header: 'Tipo', key: 'typeLabel' },
        { header: 'Monto', key: 'amount', format: 'currency' as const },
    ];

    const exportSummary = [
        { label: 'Total Ingresos Netos del Año', value: formatCurrency(totalAnnualIncome) },
        { label: 'Total Egresos Netos del Año', value: formatCurrency(totalAnnualExpense) },
        { label: 'Saldo Neto del Año', value: formatCurrency(totalAnnualNet) }
    ];

    const monthsKeys = Object.keys(monthlyFlow).sort();

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <Link href="/reports" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                        <ArrowLeft size={18} />
                        Volver a Informes
                    </Link>
                    <Link href="/reports/cashflow" className="flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors text-sm">
                        Ver Flujo de Caja Mensual
                    </Link>
                </div>
                <div className="flex gap-4 items-center w-full sm:w-auto justify-end">
                    <YearFilter years={availableYears} />
                    <ExportButtons
                        data={normalizedMovements}
                        columns={exportColumns}
                        fileName={`flujo_anual_neto_${selectedYear}`}
                        title={`Flujo Anual Neto - Año ${selectedYear}`}
                        summary={exportSummary}
                    />
                </div>
            </div>

            <header>
                <h2 className="text-xl md:text-3xl font-bold text-white">Flujo Anual Neto</h2>
                <p className="text-sm md:text-base text-slate-400">Ingresos y egresos netos reales del año {selectedYear}</p>
            </header>

            {/* Resumen Anual Global */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Ingresos Netos del Año</p>
                        <h3 className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(totalAnnualIncome)}</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                        <TrendingUp size={24} />
                    </div>
                </div>

                <div className="glass-card p-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Egresos Netos del Año</p>
                        <h3 className="text-2xl font-bold text-rose-400 mt-1">{formatCurrency(totalAnnualExpense)}</h3>
                    </div>
                    <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400">
                        <TrendingDown size={24} />
                    </div>
                </div>

                <div className="glass-card p-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Saldo Neto Anual</p>
                        <h3 className={`text-2xl font-extrabold mt-1 ${totalAnnualNet >= 0 ? 'text-sky-400' : 'text-rose-500'}`}>
                            {formatCurrency(totalAnnualNet)}
                        </h3>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${totalAnnualNet >= 0 ? 'bg-sky-500/10 text-sky-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {totalAnnualNet >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                </div>
            </div>

            {/* Desglose Mensual del Año */}
            <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">Desglose Mensual</h3>
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-slate-300">
                            <tr>
                                <th className="p-2 md:p-4 text-xs md:text-sm font-semibold">Mes</th>
                                <th className="p-2 md:p-4 text-right text-xs md:text-sm font-semibold text-emerald-400">Ingresos</th>
                                <th className="p-2 md:p-4 text-right text-xs md:text-sm font-semibold text-rose-400">Egresos</th>
                                <th className="p-2 md:p-4 text-right text-xs md:text-sm font-semibold">Saldo</th>
                                <th className="p-2 md:p-4 text-center text-xs md:text-sm font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {monthsKeys.map((key: string) => {
                                const flow = monthlyFlow[key];
                                const net = flow.income - flow.expense;
                                const isNoActivity = flow.income === 0 && flow.expense === 0;

                                return (
                                    <tr key={key} className="hover:bg-white/5 transition-colors">
                                        <td className="p-2 md:p-4 text-slate-300 font-medium text-xs md:text-sm">
                                            {formatMonthName(key)}
                                        </td>
                                        <td className="p-2 md:p-4 text-right text-emerald-400 font-bold text-xs md:text-sm">
                                            {flow.income > 0 ? formatCurrency(flow.income) : '-'}
                                        </td>
                                        <td className="p-2 md:p-4 text-right text-rose-400 font-bold text-xs md:text-sm">
                                            {flow.expense > 0 ? formatCurrency(flow.expense) : '-'}
                                        </td>
                                        <td className={`p-2 md:p-4 text-right font-extrabold text-xs md:text-sm ${isNoActivity ? 'text-slate-500' : net >= 0 ? 'text-sky-400' : 'text-rose-500'}`}>
                                            {isNoActivity ? '-' : formatCurrency(net)}
                                        </td>
                                        <td className="p-2 md:p-4 text-center">
                                            <Link
                                                href={`/reports/cashflow?month=${key}`}
                                                className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 hover:underline font-bold transition-all"
                                            >
                                                Ver Detalle
                                                <ArrowRight size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detalle de Movimientos del Año */}
            <div className="pt-8 border-t border-white/10">
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">Detalle de Movimientos del Año</h3>
                <div className="glass-card overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto">
                        <table className="w-full text-left text-sm relative">
                            <thead className="bg-slate-900 text-slate-300 sticky top-0 z-10 shadow-md">
                                <tr>
                                    <th className="p-3 text-xs md:text-sm">Fecha</th>
                                    <th className="p-3 text-xs md:text-sm">Proyecto</th>
                                    <th className="p-3 text-xs md:text-sm">Tipo Movimiento</th>
                                    <th className="p-3 text-xs md:text-sm">Concepto</th>
                                    <th className="p-3 text-right text-xs md:text-sm">Monto (Neto)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-slate-950/20">
                                {normalizedMovements.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-slate-500">Sin movimientos registrados este año</td>
                                    </tr>
                                ) : normalizedMovements.map((item: any) => {
                                    return (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-slate-400 whitespace-nowrap text-xs md:text-sm">{formatDate(item.date)}</td>
                                            <td className="p-3 text-slate-300 font-medium text-xs md:text-sm">{item.projectName}</td>
                                            <td className="p-3 text-slate-400 text-xs md:text-sm">{item.movementName}</td>
                                            <td className="p-3 text-slate-400">
                                                <div className="flex flex-col">
                                                    <span className="text-xs md:text-sm">{item.title}</span>
                                                    {item.observations && <span className="text-[10px] md:text-xs text-slate-500 truncate max-w-[200px] md:max-w-none">{item.observations}</span>}
                                                </div>
                                            </td>
                                            <td className={`p-3 text-right font-bold text-xs md:text-sm ${item.isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {formatCurrency(Math.abs(item.amount))}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
