"use client";

import { useState } from 'react';
import { Mail, Phone, MapPin, Plus, Edit, Trash2, Globe, FileText } from 'lucide-react';
import Link from 'next/link';
import EmployeeModal from './EmployeeModal';
import { deleteEmployee } from '@/lib/employee-actions';

export default function EmployeeList({ initialEmployees }: { initialEmployees: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);

    const handleEdit = (emp: any) => {
        setEditingEmployee(emp);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
            await deleteEmployee(id);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Directorio de Empleados</h2>
                    <p className="text-slate-400">Equipo de trabajo de Tangente</p>
                </div>
                <button
                    onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20"
                >
                    <Plus size={20} />
                    Nuevo empleado
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialEmployees.map((emp) => (
                    <div key={emp.id} className="glass-card p-6 flex flex-col group hover:bg-white/5 transition-all relative">
                        {/* Acciones Rápidas */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEdit(emp)}
                                className="p-2 bg-white/5 hover:bg-sky-500/20 text-slate-400 hover:text-sky-400 rounded-lg transition-colors"
                                title="Editar"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(emp.id)}
                                className="p-2 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-sky-500/10 rounded-full flex items-center justify-center text-sky-400 border border-sky-500/20 shrink-0">
                                <span className="text-xl font-bold">{emp.firstName[0]}{emp.lastName[0]}</span>
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="text-lg font-bold text-white truncate">{emp.firstName} {emp.lastName}</h3>
                                <p className="text-sky-400 text-xs font-medium uppercase tracking-wider">{emp.position || 'Colaborador'}</p>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-slate-500" />
                                <span className="truncate">{emp.email || 'Sin correo'}</span>
                            </div>

                            {(emp.phoneMobile || emp.phoneWork) && (
                                <div className="flex flex-col gap-1.5 p-2 bg-white/5 rounded-lg border border-white/5">
                                    {emp.phoneMobile && (
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-sky-500/60" />
                                            <span className="text-xs text-slate-300">{emp.phoneMobile}</span>
                                            <span className="text-[10px] text-slate-500 italic">Móvil</span>
                                        </div>
                                    )}
                                    {emp.phoneWork && (
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-emerald-500/60" />
                                            <span className="text-xs text-slate-300">{emp.phoneWork}</span>
                                            <span className="text-[10px] text-slate-500 italic">Trabajo</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-start gap-2 pt-2 border-t border-white/5">
                                <MapPin size={14} className="mt-0.5 text-slate-500" />
                                <div className="text-xs">
                                    <p className="text-slate-300 font-semibold">{emp.organization || 'Sin Organización'}</p>
                                    {(emp.city || emp.countryRegion) && (
                                        <p className="text-slate-500 mt-0.5">{emp.city}{emp.countryRegion ? `, ${emp.countryRegion}` : ''}</p>
                                    )}
                                </div>
                            </div>

                            {emp.webPage && (
                                <div className="flex items-center gap-2">
                                    <Globe size={14} className="text-slate-500" />
                                    <a href={emp.webPage.startsWith('http') ? emp.webPage : `https://${emp.webPage}`} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:underline truncate">
                                        Sitio Web
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex gap-2">
                            <Link
                                href={`/employees/${emp.id}`}
                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1"
                            >
                                Perfil
                            </Link>
                            <Link
                                href={`/employees/${emp.id}`}
                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1"
                            >
                                <FileText size={12} /> Proyectos
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <EmployeeModal
                    employee={editingEmployee}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}
