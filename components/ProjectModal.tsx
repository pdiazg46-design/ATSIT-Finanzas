"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createProject, updateProject } from '@/lib/project-actions';
import { X, Briefcase, Calendar, DollarSign, FileText, Plus, RefreshCw, Send } from 'lucide-react';

type Tab = 'datos' | 'fechas' | 'finanzas' | 'observaciones';

export default function ProjectModal({
    project,
    employees,
    categories = [],
    currentUser,
    onClose
}: {
    project?: any,
    employees: any[],
    categories?: string[],
    currentUser?: any,
    onClose: () => void
}) {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('datos');

    // Estado local para los empleados y la selección del propietario
    const [localEmployees, setLocalEmployees] = useState(employees);
    const [selectedOwnerId, setSelectedOwnerId] = useState<string>(
        project?.ownerId ? project.ownerId.toString() : ''
    );

    // Estados para la creación rápida de responsables (empleados)
    const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [isSavingEmployee, setIsSavingEmployee] = useState(false);
    const [employeeError, setEmployeeError] = useState('');



    // Estados para el formateo dinámico de valores monetarios con puntos
    const [incomeInput, setIncomeInput] = useState<string>(() => {
        return project?.expectedIncome ? new Intl.NumberFormat('es-CL').format(project.expectedIncome) : '';
    });
    const [utilityInput, setUtilityInput] = useState<string>(() => {
        return project?.expectedUtility ? new Intl.NumberFormat('es-CL').format(project.expectedUtility) : '';
    });

    const handleMoneyChange = (val: string, setter: (v: string) => void) => {
        const cleanVal = val.replace(/\D/g, '');
        if (cleanVal === '') {
            setter('');
            return;
        }
        setter(new Intl.NumberFormat('es-CL').format(parseInt(cleanVal, 10)));
    };

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleSaveEmployee = async () => {
        if (!newFirstName.trim() || !newLastName.trim()) {
            setEmployeeError('El nombre y el apellido son requeridos.');
            return;
        }
        setIsSavingEmployee(true);
        setEmployeeError('');
        try {
            const { upsertEmployee } = await import('@/lib/employee-actions');
            const newEmp = await upsertEmployee({
                firstName: newFirstName.trim(),
                lastName: newLastName.trim(),
                organization: 'Sistema Financiero',
                position: 'Colaborador'
            });

            if (newEmp && newEmp.id) {
                setLocalEmployees(prev => [...prev, newEmp]);
                setSelectedOwnerId(newEmp.id.toString());
                setIsCreatingEmployee(false);
                setNewFirstName('');
                setNewLastName('');
            } else {
                setEmployeeError('No se pudo guardar el empleado.');
            }
        } catch (e) {
            console.error(e);
            setEmployeeError('Error al guardar el colaborador.');
        } finally {
            setIsSavingEmployee(false);
        }
    };





    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 sm:p-6" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-[#1e293b] w-full max-w-2xl max-h-[90vh] flex flex-col relative rounded-2xl border border-sky-500/20 shadow-2xl shadow-sky-500/10 animate-in fade-in zoom-in duration-200 overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-[100] p-2 hover:bg-white/5 rounded-full"
                >
                    <X size={24} />
                </button>

                <div className="p-6 md:p-8 pb-4 border-b border-white/5 shrink-0">
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                        {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Gestión de datos del proyecto</p>
                </div>

                <div className="flex px-6 md:px-8 gap-4 border-b border-white/5 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('datos')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'datos' ? 'text-sky-400 border-sky-400' : 'text-slate-500 border-transparent hover:text-white'}`}
                    >
                        <Briefcase size={16} />
                        Datos
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('fechas')}
                        className={`pb-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'fechas' ? 'text-sky-400 border-sky-400' : 'text-slate-500 border-transparent hover:text-white'}`}
                    >
                        <Calendar size={16} />
                        Fechas y Estado
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
                        name: formData.get('name'),
                        description: formData.get('description'),
                        ownerId: parseInt(formData.get('ownerId') as string) || null,
                        category: formData.get('category'),
                        status: formData.get('status'),
                        priority: formData.get('priority'),
                        startDate: formData.get('startDate'),
                        endDate: formData.get('endDate'),
                        expectedIncome: parseFloat(formData.get('expectedIncome') as string) || 0,
                        expectedUtility: parseFloat(formData.get('expectedUtility') as string) || 0,
                        budgetDays: parseFloat(formData.get('budgetDays') as string) || 0,
                        notes: project?.notes || '',
                        observations: project?.observations || '',
                    };

                    if (project?.id) {
                        await updateProject(project.id, data);
                    } else {
                        await createProject(data);
                    }
                    onClose();
                }} className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
                    <div className="p-6 md:p-8 pt-6 space-y-6 flex-1">

                        {/* TAB: DATOS */}
                        <div className={`space-y-4 ${activeTab === 'datos' ? 'block' : 'hidden'}`}>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Nombre del Proyecto *</label>
                                <input
                                    name="name"
                                    required
                                    defaultValue={project?.name}
                                    autoFocus={!project}
                                    placeholder="Ej: Desarrollo Web Cliente XYZ"
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Descripción</label>
                                <textarea
                                    name="description"
                                    defaultValue={project?.description}
                                    placeholder="Descripción breve del proyecto..."
                                    rows={3}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Propietario / Responsable *</label>
                                        {!isCreatingEmployee && (
                                            <button
                                                type="button"
                                                onClick={() => setIsCreatingEmployee(true)}
                                                className="text-[10px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition-colors"
                                            >
                                                <Plus size={12} />
                                                Crear responsable
                                            </button>
                                        )}
                                    </div>
                                    <input type="hidden" name="ownerId" value={selectedOwnerId} />

                                    {isCreatingEmployee ? (
                                        <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3">
                                            <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Nuevo Responsable</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Nombre *"
                                                    value={newFirstName}
                                                    onChange={(e) => setNewFirstName(e.target.value)}
                                                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Apellido *"
                                                    value={newLastName}
                                                    onChange={(e) => setNewLastName(e.target.value)}
                                                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                                                />
                                            </div>
                                            {employeeError && <p className="text-[10px] text-rose-400">{employeeError}</p>}
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCreatingEmployee(false);
                                                        setEmployeeError('');
                                                    }}
                                                    className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-bold transition-all"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isSavingEmployee}
                                                    onClick={handleSaveEmployee}
                                                    className="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-[10px] font-bold disabled:opacity-50 transition-all flex items-center gap-1"
                                                >
                                                    {isSavingEmployee ? (
                                                        <>
                                                            <RefreshCw className="h-3 w-3 animate-spin" /> Guardando...
                                                        </>
                                                    ) : 'Guardar'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <select
                                                required
                                                value={selectedOwnerId}
                                                onChange={(e) => setSelectedOwnerId(e.target.value)}
                                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 cursor-pointer appearance-none text-sm"
                                            >
                                                <option value="">Seleccionar responsable...</option>
                                                {localEmployees.map(e => <option key={e.id} value={e.id} className="bg-slate-900">{e.firstName} {e.lastName}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Categoría</label>
                                    <input
                                        name="category"
                                        defaultValue={project?.category}
                                        list="project-categories-list"
                                        placeholder="Ej: Desarrollo, Consultoría"
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all text-sm"
                                        autoComplete="off"
                                    />
                                    <datalist id="project-categories-list">
                                        {categories.map((c, idx) => <option key={idx} value={c} />)}
                                    </datalist>
                                </div>
                            </div>
                        </div>

                        {/* TAB: FECHAS Y ESTADO */}
                        <div className={`space-y-4 ${activeTab === 'fechas' ? 'block' : 'hidden'}`}>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Estado</label>
                                    <div className="relative">
                                        <select
                                            name="status"
                                            defaultValue={project?.status || 'En curso'}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 cursor-pointer appearance-none text-sm"
                                        >
                                            <option value="En curso">En curso</option>
                                            <option value="Completado">Completado</option>
                                            <option value="Retrasado">Retrasado</option>
                                            <option value="Pendiente">Pendiente</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Prioridad</label>
                                    <div className="relative">
                                        <select
                                            name="priority"
                                            defaultValue={project?.priority || '(2) Normal'}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 cursor-pointer appearance-none text-sm"
                                        >
                                            <option value="(1) Alta">(1) Alta</option>
                                            <option value="(2) Normal">(2) Normal</option>
                                            <option value="(3) Baja">(3) Baja</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Inicio</label>
                                        <input
                                            name="startDate"
                                            type="date"
                                            defaultValue={project?.startDate}
                                            onClick={(e) => e.currentTarget.showPicker()}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all font-mono text-sm cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Término</label>
                                        <input
                                            name="endDate"
                                            type="date"
                                            defaultValue={project?.endDate}
                                            onClick={(e) => e.currentTarget.showPicker()}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all font-mono text-sm cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TAB: FINANZAS */}
                        <div className={`space-y-4 ${activeTab === 'finanzas' ? 'block' : 'hidden'}`}>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Ingreso Esperado (CLP)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={incomeInput}
                                        onChange={(e) => handleMoneyChange(e.target.value, setIncomeInput)}
                                        placeholder="Ej: 8.000.000"
                                        onFocus={(e) => (e.target as HTMLInputElement).select()}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                                    />
                                    <input type="hidden" name="expectedIncome" value={incomeInput.replace(/\D/g, '') || '0'} />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-500/50">CLP</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Utilidad Estimada (CLP)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={utilityInput}
                                            onChange={(e) => handleMoneyChange(e.target.value, setUtilityInput)}
                                            placeholder="Ej: 2.000.000"
                                            onFocus={(e) => (e.target as HTMLInputElement).select()}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all text-sm font-mono"
                                        />
                                        <input type="hidden" name="expectedUtility" value={utilityInput.replace(/\D/g, '') || '0'} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Días Presupuesto</label>
                                    <input
                                        name="budgetDays"
                                        type="number"
                                        step="0.1"
                                        defaultValue={project?.budgetDays || "0"}
                                        onFocus={(e) => (e.target as HTMLInputElement).select()}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <input type="hidden" name="notes" value={project?.notes || ''} />
                        <input type="hidden" name="observations" value={project?.observations || ''} />

                        {project?.lastActionAt && (
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                <span className="w-2 h-2 rounded-full bg-slate-500/30"></span>
                                Última acción: {project.lastActionAt}
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-white/5 bg-slate-900/50 flex gap-4 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[1.5] px-4 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-lg shadow-sky-500/20 transition-all text-base"
                        >
                            {project ? 'Guardar Cambios' : 'Crear Proyecto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
