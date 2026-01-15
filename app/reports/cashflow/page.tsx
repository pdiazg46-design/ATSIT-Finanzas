import { db } from '@/lib/db';
import { projects, tasks, vatPayments } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import ExportButtons from '@/components/ExportButtons';
import MonthFilter from '@/components/MonthFilter';

export default async function CashFlowPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
    const params = await searchParams;
    const selectedMonth = params.month || new Date().toISOString().slice(0, 7); // Default to current month

    // 1. Fetch Task Movements
    const allMovements = await db.select()
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .all();

    // 2. Fetch VAT Payments
    const allPayments = await db.select().from(vatPayments).all();

    const monthlyFlow: Record<string, { income: number, expense: number }> = {};

    // Process Movements - Filter by Selected Month
    allMovements.forEach((row: any) => {
        const m = row.tasks;
        if (!m.startDate) return;

        const date = new Date(m.startDate);
        if (isNaN(date.getTime())) return;

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        // Filter logic: Only process if matches selected month
        if (key !== selectedMonth) return;

        if (!monthlyFlow[key]) {
            monthlyFlow[key] = { income: 0, expense: 0 };
        }

        const val = m.totalValue || m.netValue || 0;

        if (val > 0) {
            monthlyFlow[key].income += val;
        } else {
            monthlyFlow[key].expense += Math.abs(val);
        }
    });

    // Process VAT Payments - Filter by Selected Month
    allPayments.forEach((p: any) => {
        const date = new Date(p.paymentDate);
        if (isNaN(date.getTime())) return;

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        // Filter logic
        if (key !== selectedMonth) return;

        if (!monthlyFlow[key]) {
            monthlyFlow[key] = { income: 0, expense: 0 };
        }

        // Payments are always expenses
        monthlyFlow[key].expense += p.amount;
    });

    const months = Object.keys(monthlyFlow).sort();

    // Unified List for Table - Filter by Selected Month
    const normalizedMovements = [
        ...allMovements.map((row: any) => {
            const t = row.tasks;
            const p = row.projects;
            const val = t.totalValue || t.netValue || 0;
            return {
                id: `task-${t.id}`,
                date: t.startDate ? new Date(t.startDate) : null,
                projectName: p?.name || 'Sin Proyecto',
                title: t.title,
                observations: t.observations,
                amount: val,
                isIncome: val > 0,
                typeLabel: val > 0 ? 'Ingreso' : 'Egreso'
            };
        }),
        ...allPayments.map((p: any) => {
            return {
                id: `payment-${p.id}`,
                date: new Date(p.paymentDate),
                projectName: 'Impuestos (SII)',
                title: 'Pago IVA Mensual',
                observations: p.notes,
                amount: -p.amount,
                isIncome: false,
                typeLabel: 'Egreso'
            };
        })
    ].filter((item: any) => {
        if (!item.date) return false;
        const key = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`;
        return key === selectedMonth;
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

    const formatMonth = (key: string) => {
        const [year, month] = key.split('-');
        return `${month}/${year}`;
    };

    const formatDate = (date: Date | null) => {
        if (!date || isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('es-CL');
    };

    const exportColumns = [
        { header: 'Fecha', key: 'date', format: 'date' as const },
        { header: 'Proyecto', key: 'projectName' },
        { header: 'Descripción', key: 'title' },
        { header: 'Tipo', key: 'typeLabel' },
        { header: 'Monto', key: 'amount', format: 'currency' as const },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <Link href="/reports" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    Volver a Informes
                </Link>
                <div className="flex gap-4 items-center">
                    <MonthFilter />
                    <ExportButtons
                        data={normalizedMovements}
                        columns={exportColumns}
                        fileName={`flujo_caja_${selectedMonth}`}
                        title={`Flujo de Caja - ${formatMonth(selectedMonth)}`}
                    />
                </div>
            </div>

            <header>
                <h2 className="text-xl md:text-3xl font-bold text-white">Flujo de Caja</h2>
                <p className="text-sm md:text-base text-slate-400">Ingresos y egresos del periodo {formatMonth(selectedMonth)}</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {months.length === 0 ? (
                    <div className="glass-card p-8 md:p-12 text-center text-slate-500 italic">
                        No hay movimientos registrados para este mes.
                    </div>
                ) : (
                    months.map((m: string) => {
                        const flow = monthlyFlow[m];
                        const net = flow.income - flow.expense;
                        return (
                            <div key={m} className="glass-card p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0">
                                <div>
                                    <p className="text-xs md:text-sm text-slate-500 uppercase font-bold tracking-widest">{formatMonth(m)}</p>
                                    <h3 className="text-lg md:text-xl font-bold text-white">Resumen Mensual</h3>
                                </div>

                                <div className="grid grid-cols-3 w-full md:w-auto md:flex md:gap-12 gap-4">
                                    <div className="text-left md:text-right">
                                        <p className="text-[10px] md:text-xs text-slate-500 flex items-center justify-start md:justify-end gap-1"><TrendingUp size={12} className="text-emerald-500" />Ingresos</p>
                                        <p className="text-sm md:text-lg font-bold text-emerald-400">{formatCurrency(flow.income)}</p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-[10px] md:text-xs text-slate-500 flex items-center justify-start md:justify-end gap-1"><TrendingDown size={12} className="text-rose-500" />Egresos</p>
                                        <p className="text-sm md:text-lg font-bold text-rose-400">{formatCurrency(flow.expense)}</p>
                                    </div>
                                    <div className="text-left md:text-right border-l border-white/10 pl-4 md:pl-12">
                                        <p className="text-[10px] md:text-xs text-slate-500">Saldo del Mes</p>
                                        <p className={`text-base md:text-xl font-extrabold ${net >= 0 ? 'text-sky-400' : 'text-rose-500'}`}>{formatCurrency(net)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="pt-8 border-t border-white/10">
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">Detalle de Movimientos</h3>
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-slate-300">
                            <tr>
                                <th className="p-2 md:p-3 text-xs md:text-sm">Fecha</th>
                                <th className="p-2 md:p-3 text-xs md:text-sm">Proyecto</th>
                                <th className="p-2 md:p-3 text-xs md:text-sm">Descripción</th>
                                <th className="p-2 md:p-3 text-right text-xs md:text-sm">Monto (Total)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {normalizedMovements.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-slate-500">Sin movimientos</td>
                                </tr>
                            ) : normalizedMovements.map((item: any) => {
                                return (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-2 md:p-3 text-slate-400 whitespace-nowrap text-xs md:text-sm">{formatDate(item.date)}</td>
                                        <td className="p-2 md:p-3 text-slate-300 font-medium text-xs md:text-sm">{item.projectName}</td>
                                        <td className="p-2 md:p-3 text-slate-400">
                                            <div className="flex flex-col">
                                                <span className="text-xs md:text-sm">{item.title}</span>
                                                {item.observations && <span className="text-[10px] md:text-xs text-slate-500 truncate max-w-[150px] md:max-w-none">{item.observations}</span>}
                                            </div>
                                        </td>
                                        <td className={`p-2 md:p-3 text-right font-bold text-xs md:text-sm ${item.isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
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
    );
}
