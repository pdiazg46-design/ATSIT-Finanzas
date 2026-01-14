'use client';

import { addVatPayment, updateVatPayment } from '@/lib/vat-actions';
import { useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';

interface VatPayment {
    id: number;
    paymentDate: string;
    amount: number;
    notes: string | null;
}

interface VatPaymentFormProps {
    editingPayment?: VatPayment | null;
    onSuccess?: () => void;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 shadow-lg 
                ${isEditing
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                    : 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/20'
                } text-white`}
        >
            {pending ? 'Guardando...' : (isEditing ? 'Actualizar Pago' : 'Registrar Pago')}
        </button>
    );
}

export default function VatPaymentForm({ editingPayment, onSuccess }: VatPaymentFormProps) {
    const formRef = useRef<HTMLFormElement>(null);

    // Reset form when switching between edit/create modes
    useEffect(() => {
        if (formRef.current) {
            formRef.current.reset();
        }
    }, [editingPayment]);

    async function action(formData: FormData) {
        if (editingPayment) {
            await updateVatPayment(editingPayment.id, formData);
        } else {
            await addVatPayment(formData);
        }

        formRef.current?.reset();
        if (onSuccess) {
            onSuccess();
        }
    }

    return (
        <form ref={formRef} action={action} key={editingPayment ? editingPayment.id : 'new'} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fecha de Pago</label>
                <input
                    type="date"
                    name="date"
                    required
                    defaultValue={editingPayment?.paymentDate || new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monto (CLP)</label>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-500">$</span>
                    <input
                        type="number"
                        name="amount"
                        required
                        min="1"
                        defaultValue={editingPayment?.amount}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-8 text-white focus:outline-none focus:border-sky-500 transition-colors"
                        placeholder="0"
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Observaciones</label>
                <textarea
                    name="notes"
                    rows={4}
                    defaultValue={editingPayment?.notes || ''}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
                    placeholder="Detalles adicionales sobre el pago..."
                />
            </div>
            <div className="pt-2">
                <SubmitButton isEditing={!!editingPayment} />
            </div>
        </form>
    );
}
