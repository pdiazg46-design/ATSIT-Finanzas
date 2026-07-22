"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createTask, updateTask } from '@/lib/task-actions';
import { X, FileText, Calendar, DollarSign, User, Tag } from 'lucide-react';

type Tab = 'concepto' | 'fechas' | 'finanzas';

export default function AddTaskModal({
    projectId,
    employees,
    movements,
    documents,
    onClose,
    task
}: {
    projectId: number,
    employees: any[],
    movements: any[],
    documents: any[],
    onClose: () => void,
    task?: any
}) {
    // We use absolute value for input, backend handles the sign
    const [netValue, setNetValue] = useState(task ? Math.abs(task.netValue) : 0);
    const [movementId, setMovementId] = useState(task?.movementId || movements[0]?.id);
    const [documentId, setDocumentId] = useState(task?.documentId || documents[0]?.id || 1);
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('concepto');

    useEffect(() => {
        setMounted(true);
        // Evitar scroll en el fondo
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const currentMovement = movements.find(m => m.id === movementId);
    const isIncome = currentMovement?.type === 'Ingreso';

    const ingresos = movements.filter(m => m.type === 'Ingreso');
    const gastos = movements.filter(m => m.type === 'Gasto');

    // Date Logic
    const getTodayStr = () => new Date().toISOString().split('T')[0];
    const initialDate = task?.startDate ? task.startDate : getTodayStr();

    const [startDate, setStartDate] = useState(initialDate);
    const [dueDate, setDueDate] = useState(task?.dueDate || initialDate);
    const [paymentDate, setPaymentDate] = useState(task?.paymentDate || '');

    // Track if user manually changed dates to stop auto-sync
    const [manualDueDate, setManualDueDate] = useState(false);
    const [manualPaymentDate, setManualPaymentDate] = useState(!!task?.paymentDate);

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setStartDate(newDate);

        // Auto-sync if not manually changed (only for due date)
        if (!manualDueDate) setDueDate(newDate);
    };

    // Tax Logic (2026 Update)
    const isInvoice = documentId === 42; // Factura Electrónica
    const isHonorarium = documentId === 44; // Boleta Honorarios

    let taxValue = 0;
    let taxLabel = '';

    if (isInvoice) {
        taxValue = netValue * 0.19;
        taxLabel = 'IVA (19%)';
    } else if (isHonorarium) {
        // Tasa 2026: 15.25%
        // Cálculo basado en Líquido -> Retención
        const rate = 0.1525;
        taxValue = netValue * (rate / (1 - rate));
        taxLabel = `Retención (${(rate * 100).toFixed(2)}%)`;
    }

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 sm:p-6" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className={`bg-[#1e293b] w-full max-w-2xl max-h-[90vh] flex flex-col relative rounded-2xl border ${isIncome ? 'border-emerald-500/30 shadow-emerald-500/5' : 'border-rose-500/30 shadow-rose-500/5'} shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden`}>
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-[100] p-2 hover:bg-white/5 rounded-full"
                >
                    <X size={24} />
                </button>

                <div className="p-6 md:p-8 pb-4 border-b border-white/5 shrink-0 flex justify-between items-end">
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white">
                            {task ? 'Editar Tarea' : 'Nueva Tarea'}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">{isIncome ? 'Registro de Ingreso' : 'Registro de Gasto'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest ${isIncome ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {isIncome ? 'Ingreso ↗' : 'Gasto ↘'}
                    </span>
                </div>

                <div className="flex px-6 md:px-8 gap-4 border-b border-white/5 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('concepto')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'concepto' ? 'text-sky-400 border-sky-400' : 'text-slate-500 border-transparent hover:text-white'}`}
                    >
                        <Tag size={16} />
                        Concepto
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('fechas')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'fechas' ? 'text-sky-400 border-sky-400' : 'text-slate-500 border-transparent hover:text-white'}`}
                    >
                        <Calendar size={16} />
                        Fechas y Doc.
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('finanzas')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'finanzas' ? 'text-sky-400 border-sky-400' : 'text-slate-500 border-transparent hover:text-white'}`}
                    >
                        <DollarSign size={16} />
                        Finanzas
                    </button>
                </div>

                <form action={async (formData) => {
                    const data = {
                        projectId,
                        title: formData.get('title'),
                        employeeId: parseInt(formData.get('employeeId') as string),
                        movementId: parseInt(formData.get('movementId') as string),
                        documentId: parseInt(formData.get('documentId') as string),
                        docNumber: formData.get('docNumber'),
                        netValue: parseFloat(formData.get('netValue') as string),
                        costDays: parseFloat(formData.get('costDays') as string) || 0,
                        status: formData.get('status') || 'Completado',
                        observations: formData.get('observations') || '',
                        startDate: startDate,
                        dueDate: dueDate,
                        paymentDate: paymentDate,
                    };

                    if (task?.id) {
                        await updateTask(task.id, data);
                    } else {
                        await createTask(data);
                    }
                    onClose();
                }} className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
                    <div className="p-6 md:p-8 pt-6 space-y-6 flex-1">

                        {/* TAB: CONCEPTO */}
                        <div className={`space-y-4 ${activeTab === 'concepto' ? 'block' : 'hidden'}`}>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Título / Concepto</label>
                                <input
                                    name="title"
                                    required
                                    defaultValue={task?.title}
                                    autoFocus={!task}
                                    onFocus={(e) => e.target.select()}
                                    placeholder="Ej: Pago de materiales, Honorarios..."
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Responsable</label>
                                    <div className="relative">
                                        <select
                                            name="employeeId"
                                            defaultValue={task?.employeeId}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 cursor-pointer appearance-none"
                                        >
                                            {employees.map(e => <option key={e.id} value={e.id} className="bg-slate-900">{e.firstName} {e.lastName}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Tipo Movimiento</label>
                                    <div className="relative">
                                         <select
                                             name="movementId"
                                             value={movementId}
                                             onChange={(e) => setMovementId(parseInt(e.target.value))}
                                             className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 cursor-pointer appearance-none font-medium"
                                         >
                                             {ingresos.length > 0 && (
                                                 <optgroup label="INGRESOS ↗" className="bg-slate-900 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                                     {ingresos.map(m => (
                                                         <option key={m.id} value={m.id} className="bg-slate-900 text-white font-medium text-sm normal-case">
                                                             {m.name}
                                                         </option>
                                                     ))}
                                                 </optgroup>
                                             )}
                                             {gastos.length > 0 && (
                                                 <optgroup label="GASTOS ↘" className="bg-slate-900 text-rose-400 font-bold text-xs uppercase tracking-wider">
                                                     {gastos.map(m => (
                                                         <option key={m.id} value={m.id} className="bg-slate-900 text-white font-medium text-sm normal-case">
                                                             {m.name}
                                                         </option>
                                                     ))}
                                                 </optgroup>
                                             )}
                                         </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Observaciones</label>
                                <textarea
                                    name="observations"
                                    defaultValue={task?.observations}
                                    onFocus={(e) => e.target.select()}
                                    placeholder="Detalles adicionales..."
                                    rows={3}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all resize-none"
                                />
                            </div>
                        </div>


                        {/* TAB: FECHAS Y DOC */}
                        <div className={`space-y-4 ${activeTab === 'fechas' ? 'block' : 'hidden'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Documento</label>
                                    <div className="relative">
                                        <select
                                            name="documentId"
                                            value={documentId}
                                            onChange={(e) => setDocumentId(parseInt(e.target.value))}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 cursor-pointer appearance-none"
                                        >
                                            {documents.map(d => <option key={d.id} value={d.id} className="bg-slate-900">{d.name}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">N° Documento</label>
                                    <input
                                        name="docNumber"
                                        defaultValue={task?.docNumber}
                                        onFocus={(e) => e.target.select()}
                                        placeholder="Ej: 123456"
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Fecha Documento</label>
                                    <div className="relative group">
                                        <div className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white flex items-center justify-between group-focus-within:border-sky-500 transition-colors">
                                            <span className="font-medium">
                                                {startDate ? startDate.split('-').reverse().join('/') : 'dd/mm/aaaa'}
                                            </span>
                                            <Calendar size={18} className="text-slate-400" />
                                        </div>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={startDate}
                                            onChange={handleStartDateChange}
                                            onClick={(e) => e.currentTarget.showPicker()}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Vencimiento</label>
                                        <div className="relative group">
                                            <div className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white flex items-center justify-between group-focus-within:border-sky-500 transition-colors">
                                                <span className="font-medium">
                                                    {dueDate ? dueDate.split('-').reverse().join('/') : 'dd/mm/aaaa'}
                                                </span>
                                                <Calendar size={18} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="date"
                                                name="dueDate"
                                                value={dueDate}
                                                onChange={(e) => {
                                                    setDueDate(e.target.value);
                                                    setManualDueDate(true);
                                                }}
                                                onClick={(e) => e.currentTarget.showPicker()}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Fecha Pago</label>
                                        <div className="relative group">
                                            <div className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white flex items-center justify-between group-focus-within:border-sky-500 transition-colors">
                                                <span className={paymentDate ? "font-medium" : "text-amber-500 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"}>
                                                    {paymentDate ? (
                                                        paymentDate.split('-').reverse().join('/')
                                                    ) : (
                                                        <>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                            Pendiente de Pago
                                                        </>
                                                    )}
                                                </span>
                                                <Calendar size={18} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="date"
                                                name="paymentDate"
                                                value={paymentDate}
                                                onChange={(e) => {
                                                    setPaymentDate(e.target.value);
                                                    setManualPaymentDate(true);
                                                }}
                                                onClick={(e) => e.currentTarget.showPicker()}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Estado</label>
                                <div className="relative">
                                    <select
                                        name="status"
                                        defaultValue={task?.status || 'Completado'}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 cursor-pointer appearance-none"
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="En curso">En curso</option>
                                        <option value="Completado">Completado</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TAB: FINANZAS */}
                        <div className={`space-y-4 ${activeTab === 'finanzas' ? 'block' : 'hidden'}`}>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                                    {isHonorarium ? 'Valor Líquido (CLP)' : 'Valor Neto (CLP)'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: 1.000.000"
                                        value={new Intl.NumberFormat('es-CL').format(netValue)}
                                        onChange={(e) => {
                                            // Remove dots/commas to get raw number
                                            const rawValue = e.target.value.replace(/\./g, '').replace(/,/g, '');
                                            if (rawValue === '' || /^\d+$/.test(rawValue)) {
                                                setNetValue(parseInt(rawValue || '0', 10));
                                            }
                                        }}
                                        onFocus={(e) => (e.target as HTMLInputElement).select()}
                                        className={`w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold focus:outline-none transition-all ${isIncome ? 'text-emerald-400 focus:border-emerald-500' : 'text-rose-400 focus:border-rose-500'}`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black opacity-30 tracking-tighter">CLP</span>
                                </div>
                                {/* Hidden input to send raw number to server action */}
                                <input type="hidden" name="netValue" value={netValue} />
                            </div>

                            {(taxValue !== 0) && (
                                <div className={`p-6 rounded-xl border animate-in slide-in-from-top-2 duration-300 ${isIncome ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase opacity-60">{taxLabel}</span>
                                        <span className="font-bold">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(taxValue)}</span>
                                    </div>
                                    <div className={`flex justify-between items-center text-xl font-black border-t pt-3 mt-1 ${isIncome ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
                                        <span className="text-sm">TOTAL</span>
                                        <span className="text-white">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(netValue + taxValue)}</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Días de Costo</label>
                                <input
                                    name="costDays"
                                    type="number"
                                    step="0.1"
                                    defaultValue={task?.costDays || "0"}
                                    onFocus={(e) => (e.target as HTMLInputElement).select()}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500"
                                />
                            </div>
                        </div>

                        {task?.lastActionAt && (
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                <span className="w-2 h-2 rounded-full bg-slate-500/30"></span>
                                Última acción: {task.lastActionAt}
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-white/5 bg-slate-900/50 flex gap-4 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`flex-[1.5] px-4 py-4 text-white rounded-xl font-bold shadow-lg transition-all text-lg ${isIncome ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'}`}
                        >
                            {task ? 'Guardar Cambios' : `Guardar ${isIncome ? 'Ingreso' : 'Gasto'}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
