import { getWithdrawalsData, WithdrawalItem } from '@/lib/report-actions';
import { ArrowLeft, Wallet } from 'lucide-react';
import Link from 'next/link';
import ExportButtons from '@/components/ExportButtons';

export default async function WithdrawalsReportPage() {
    const rawData = await getWithdrawalsData();

    // Grouping by Employee and then by Month
    const groupedByPartner: Record<string, Record<string, WithdrawalItem[]>> = {};
    const partnerTotals: Record<string, number> = {};

    rawData.forEach((item: any) => {
        // Use 'Sin Asignar' if employee is missing, though logic requires it
        const partnerName = item.employeeName || 'Desconocido';
        if (!item.date) return;

        const dateObj = new Date(item.date);
        const monthKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;

        if (!groupedByPartner[partnerName]) {
            groupedByPartner[partnerName] = {};
            partnerTotals[partnerName] = 0;
        }
        if (!groupedByPartner[partnerName][monthKey]) {
            groupedByPartner[partnerName][monthKey] = [];
        }

        groupedByPartner[partnerName][monthKey].push(item);

        // Amount is usually negative for expenses in DB. We display positive for withdrawals.
        partnerTotals[partnerName] += Math.abs(item.amount || 0);
    });

    const formatCurrency = (val: number | null) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    const formatMonthName = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
    };

    const partners = Object.keys(groupedByPartner).sort();

    const exportData = rawData.map((item: any) => ({
        date: item.date,
        partner: item.employeeName || 'Desconocido',
        project: item.projectName,
        amount: Math.abs(item.amount || 0)
    })).sort((a: any, b: any) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());

    const exportColumns = [
        { header: 'Fecha', key: 'date' },
        { header: 'Socio', key: 'partner' },
        { header: 'Proyecto', key: 'project' },
        { header: 'Monto Retirado', key: 'amount', format: 'currency' as const },
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
                        fileName="retiros_socios"
                        title="Informe de Retiros de Socios"
                    />
                </div>
            </div>

            <header>
                <h2 className="text-3xl font-bold text-white">Retiros de Socios</h2>
                <p className="text-slate-400">Control de transferencias y retiros personales por proyecto</p>
            </header>

            {/* Totals Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner: string) => (
                    <div key={partner} className="glass-card p-6 border-pink-500/20 bg-pink-500/5">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-pink-500/60 uppercase tracking-widest">Total Retirado</p>
                                <p className="text-lg font-bold text-white">{partner}</p>
                            </div>
                        </div>
                        <p className="text-3xl font-black text-pink-400 mt-2">{formatCurrency(partnerTotals[partner])}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {partners.map((partner: string) => {
                    // Sort months descending
                    const months = Object.keys(groupedByPartner[partner]).sort().reverse();

                    return (
                        <section key={partner} className="space-y-6">
                            <h3 className="text-xl font-bold text-sky-400 flex items-center gap-2">
                                <span className="w-2 h-8 bg-sky-500 rounded-full"></span>
                                {partner}
                            </h3>

                            {months.map((monthKey: string) => {
                                const items = groupedByPartner[partner][monthKey];
                                const monthTotal = items.reduce((acc: number, curr: any) => acc + Math.abs(curr.amount || 0), 0);

                                return (
                                    <div key={monthKey} className="glass-card p-6">
                                        <div className="flex justify-between items-end mb-4 border-b border-white/5 pb-2">
                                            <h4 className="text-lg font-bold text-white capitalize">{formatMonthName(monthKey)}</h4>
                                            <span className="text-emerald-400 font-mono font-bold">{formatCurrency(monthTotal)}</span>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead>
                                                    <tr className="text-[10px] text-slate-500 uppercase tracking-widest">
                                                        <th className="py-2">Fecha</th>
                                                        <th className="py-2">Origen</th>
                                                        <th className="py-2 text-right">Monto</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {items.map((item: any) => (
                                                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                                            <td className="py-2 text-slate-400">{item.date}</td>
                                                            <td className="py-2 text-white font-medium">{item.projectName}</td>
                                                            <td className="py-2 text-right text-pink-400 font-bold">{formatCurrency(Math.abs(item.amount || 0))}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </section>
                    );
                })}
            </div>

            {partners.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-2xl">
                    <p className="text-slate-400">No hay registros de retiros aún.</p>
                </div>
            )}
        </div>
    );
}
