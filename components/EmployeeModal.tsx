"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { upsertEmployee } from '@/lib/employee-actions';
import { X } from 'lucide-react';

export default function EmployeeModal({
    employee,
    onClose
}: {
    employee?: any,
    onClose: () => void
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 sm:p-6" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-[#1e293b] w-full max-w-3xl max-h-[90vh] flex flex-col relative rounded-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-[100] p-2 hover:bg-white/5 rounded-full"
                >
                    <X size={24} />
                </button>

                <div className="p-8 pb-4 border-b border-white/5 shrink-0">
                    <h3 className="text-2xl font-bold text-white">
                        {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
                    </h3>
                </div>

                <form action={async (formData) => {
                    const data = Object.fromEntries(formData.entries());
                    if (employee?.id) data.id = employee.id as any;
                    await upsertEmployee(data);
                    onClose();
                }} className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 custom-scrollbar">

                    {/* Sección: Información Básica */}
                    <div className="space-y-4">
                        <h4 className="text-sky-400 text-xs font-bold uppercase tracking-widest border-b border-sky-500/20 pb-2">Información Básica</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Nombre</label>
                                <input name="firstName" defaultValue={employee?.firstName} required onFocus={(e) => e.target.select()} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Apellidos</label>
                                <input name="lastName" defaultValue={employee?.lastName} required onFocus={(e) => e.target.select()} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Organización</label>
                                <input name="organization" defaultValue={employee?.organization} onFocus={(e) => e.target.select()} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Cargo / Posición</label>
                                <input name="position" defaultValue={employee?.position} onFocus={(e) => e.target.select()} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Contacto */}
                    <div className="space-y-4">
                        <h4 className="text-sky-400 text-xs font-bold uppercase tracking-widest border-b border-sky-500/20 pb-2">Contacto</h4>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Correo Electrónico</label>
                            <input name="email" type="email" defaultValue={employee?.email} onFocus={(e) => e.target.select()} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Móvil</label>
                                <input name="phoneMobile" defaultValue={employee?.phoneMobile} onFocus={(e) => e.target.select()} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-sky-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Trabajo</label>
                                <input name="phoneWork" defaultValue={employee?.phoneWork} onFocus={(e) => e.target.select()} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-sky-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Particular</label>
                                <input name="phoneHome" defaultValue={employee?.phoneHome} onFocus={(e) => e.target.select()} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-sky-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Fax</label>
                                <input name="phoneFax" defaultValue={employee?.phoneFax} onFocus={(e) => e.target.select()} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-sky-500 transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Ubicación */}
                    <div className="space-y-4">
                        <h4 className="text-sky-400 text-xs font-bold uppercase tracking-widest border-b border-sky-500/20 pb-2">Ubicación</h4>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Dirección</label>
                            <input name="address" defaultValue={employee?.address} onFocus={(e) => e.target.select()} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Ciudad</label>
                                <input name="city" defaultValue={employee?.city} onFocus={(e) => e.target.select()} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-sky-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Estado/Prov</label>
                                <input name="stateProvince" defaultValue={employee?.stateProvince} onFocus={(e) => e.target.select()} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-sky-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Código Postal</label>
                                <input name="zipPostalCode" defaultValue={employee?.zipPostalCode} onFocus={(e) => e.target.select()} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-sky-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">País/Región</label>
                                <input name="countryRegion" defaultValue={employee?.countryRegion} onFocus={(e) => e.target.select()} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-sky-500 transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Otros */}
                    <div className="space-y-4">
                        <h4 className="text-sky-400 text-xs font-bold uppercase tracking-widest border-b border-sky-500/20 pb-2">Otros</h4>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Página Web</label>
                            <input name="webPage" type="url" defaultValue={employee?.webPage} onFocus={(e) => e.target.select()} placeholder="https://..." className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Notas</label>
                            <textarea name="notes" defaultValue={employee?.notes} onFocus={(e) => e.target.select()} rows={3} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all resize-none" />
                        </div>
                    </div>

                    <div className="p-8 border-t border-white/5 bg-slate-900/50 flex gap-4 shrink-0 -mx-8 -mb-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[1.5] px-4 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-lg shadow-sky-500/20 transition-all text-lg"
                        >
                            {employee ? 'Guardar Cambios' : 'Crear Empleado'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
