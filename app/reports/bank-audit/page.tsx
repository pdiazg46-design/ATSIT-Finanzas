import { db } from '@/lib/db';
import { projects, tasks, vatPayments } from '@/lib/schema';
import { eq, sql, and, isNotNull, not, desc } from 'drizzle-orm';
import { ArrowLeft, Scale } from 'lucide-react';
import Link from 'next/link';
import ExportButtons from '@/components/ExportButtons';

export default async function BankAuditPage() {
    // 1. Fetch Paid Tasks (Income & Expenses)
    const paidTasks = await db.select({
        id: tasks.id,
        date: tasks.paymentDate,
        description: tasks.title,
        project: projects.name,
        amount: tasks.totalValue, // Gross Value (Net + Tax)
        type: tasks.netValue, // To determine sign
        docNumber: tasks.docNumber
    })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .where(and(
            isNotNull(tasks.paymentDate),
            not(eq(tasks.paymentDate, ''))
        ))
        .all();

    // 2. Fetch VAT Payments
    const taxPayments = await db.select({
        id: vatPayments.id,
        date: vatPayments.paymentDate,
        amount: vatPayments.amount,
        notes: vatPayments.notes
    }).from(vatPayments).all();

    // 3. Normalize Data
    const transactions = [
        ...paidTasks.map((t: any) => ({
            id: `task-${t.id}`,
            date: t.date,
            description: `${t.description} (Doc: ${t.docNumber || 'S/N'})`,
            project: t.project || 'General',
            // If netValue > 0 it's Income (Positive), else Expense (Negative)
            amount: t.type > 0 ? t.amount : -Math.abs(t.amount || 0),
            type: t.type > 0 ? 'Ingreso' : 'Egreso'
        })),
        ...taxPayments.map((p: any) => ({
            id: `tax-${p.id}`,
            date: p.date,
            description: `Pago IVA - ${p.notes || ''}`,
            project: 'Impuestos (SII)',
            amount: -p.amount, // Always Expense
            type: 'Pago IVA'
        }))
    ];

    // 4. Sort Chronologically (Oldest First for Running Balance)
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 5. Calculate Running Balance
    let balance = 0;
    const auditData = transactions.map((t) => {
        balance += t.amount;
        return { ...t, balance };
    });

    // 6. Reverse for Display (Newest First)
    const displayData = [...auditData].reverse();

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-CL');
    };

    const exportColumns = [
        { header: 'Fecha', key: 'date', format: 'date' as const },
        { header: 'Proyecto', key: 'project' },
        { header: 'Descripción', key: 'description' },
        { header: 'Tipo', key: 'type' },
        { header: 'Monto', key: 'amount', format: 'currency' as const },
        { header: 'Saldo Acumulado', key: 'balance', format: 'currency' as const },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    Volver al Dashboard
                </Link>
                <div className="flex gap-2">
                    <ExportButtons
                        data={auditData} // Export chronological data usually better for audits
                        columns={exportColumns}
                        fileName="auditoria_banco"
                        title="Auditoría de Saldo en Banco"
                    />
                </div>
            </div>

            <header>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400">
                        <Scale size={32} />
                    </div>
                    Auditoría de Saldo
                </h2>
                <p className="text-slate-400 mt-1">Conciliación de movimientos reales (Percibido) vs Saldo en Banco.</p>
            </header>

            {/* Current Balance Card */}
            <div className="glass-card p-6 border-sky-500/20 bg-sky-500/5 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-sky-500/60 uppercase tracking-widest">Saldo Actual Calculado</h3>
                    <p className={`text-4xl font-black mt-2 ${balance >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>
                        {formatCurrency(balance)}
                    </p>
                </div>
                <div className="text-right text-sm text-slate-500">
                    <p>Total Transacciones: {displayData.length}</p>
                    <p>Último Movimiento: {displayData[0]?.date ? formatDate(displayData[0].date) : '-'}</p>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-slate-300">
                        <tr>
                            <th className="p-3 text-xs uppercase tracking-wider font-bold">Fecha</th>
                            <th className="p-3 text-xs uppercase tracking-wider font-bold">Proyecto / Tipo</th>
                            <th className="p-3 text-xs uppercase tracking-wider font-bold">Descripción</th>
                            <th className="p-3 text-right text-xs uppercase tracking-wider font-bold">Monto</th>
                            <th className="p-3 text-right text-xs uppercase tracking-wider font-bold bg-white/5">Saldo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {displayData.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                                    No hay movimientos con fecha de pago registrada.
                                </td>
                            </tr>
                        ) : displayData.map((item: any) => (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-3 text-slate-400 whitespace-nowrap font-mono">{formatDate(item.date)}</td>
                                <td className="p-3">
                                    <div className="font-bold text-white">{item.project}</div>
                                    <div className={`text-[10px] uppercase font-bold ${item.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {item.type}
                                    </div>
                                </td>
                                <td className="p-3 text-slate-300">{item.description}</td>
                                <td className={`p-3 text-right font-bold ${item.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {formatCurrency(item.amount)}
                                </td>
                                <td className={`p-3 text-right font-bold font-mono bg-white/5 ${item.balance >= 0 ? 'text-sky-300' : 'text-rose-300'}`}>
                                    {formatCurrency(item.balance)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
