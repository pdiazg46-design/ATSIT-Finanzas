import { getVatPayments } from '@/lib/vat-actions';
import VatManager from '@/components/VatManager';
import { Wallet } from 'lucide-react';

export default async function VatPaymentsPage() {
    const payments = await getVatPayments();

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <header>
                <h2 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400">
                        <Wallet size={32} />
                    </div>
                    Pagos de Imp. (F29)
                </h2>
                <p className="text-slate-400 mt-1 ml-16">Registro y control de pagos de impuestos (IVA, Retenciones, PPM)</p>
            </header>

            <VatManager payments={payments} />
        </div>
    );
}
