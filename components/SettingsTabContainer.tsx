'use client';

import { useState } from 'react';
import { Building2, Tag, FileText, Users, BarChart3, Activity, DownloadCloud, Sparkles } from 'lucide-react';
import SettingsForm from './SettingsForm';
import UsersManager from './UsersManager';
import MovementsManager from './MovementsManager';
import DocumentsManager from './DocumentsManager';

type Tab = 'empresa' | 'movimientos' | 'documentos' | 'usuarios' | 'metricas';

interface SettingsTabContainerProps {
    initialSettings: any;
    initialUsers: any[];
    initialMovements: any[];
    initialDocuments: any[];
    demoStats?: any;
    isAdmin: boolean;
}

export default function SettingsTabContainer({
    initialSettings,
    initialUsers,
    initialMovements,
    initialDocuments,
    demoStats,
    isAdmin
}: SettingsTabContainerProps) {
    const [activeTab, setActiveTab] = useState<Tab>('empresa');

    return (
        <div className="space-y-6">
            {/* Tabs Header */}
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
                <button
                    onClick={() => setActiveTab('empresa')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'empresa' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                >
                    <Building2 size={16} />
                    Identidad de Empresa
                </button>
                <button
                    onClick={() => setActiveTab('metricas')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'metricas' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                >
                    <BarChart3 size={16} className="text-sky-400" />
                    Métricas & Descargas DEMO
                </button>
                <button
                    onClick={() => setActiveTab('movimientos')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'movimientos' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                >
                    <Tag size={16} />
                    Tipos de Movimientos ({initialMovements.length})
                </button>
                <button
                    onClick={() => setActiveTab('documentos')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'documentos' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                >
                    <FileText size={16} />
                    Tipos de Documentos ({initialDocuments.length})
                </button>
                <button
                    onClick={() => setActiveTab('usuarios')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'usuarios' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                >
                    <Users size={16} />
                    Gestión de Usuarios ({initialUsers.length})
                </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-2">
                {activeTab === 'empresa' && (
                    <SettingsForm initialSettings={initialSettings} demoStats={demoStats} />
                )}
                {activeTab === 'metricas' && (
                    <div className="space-y-6">
                        <section className="glass-card p-8 space-y-6 border-indigo-500/30 bg-slate-900/90">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <BarChart3 size={24} className="text-sky-400" />
                                        Panel Oficial de Métricas y Contador DEMO
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1">Registro consolidado de aperturas de app y descargas acumuladas</p>
                                </div>
                                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                                    <Activity size={14} className="animate-pulse" /> Sistema Sincronizado
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-950 border border-sky-500/30 shadow-lg">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Descargas Totales DEMO</span>
                                    <span className="text-4xl font-black text-sky-400">{demoStats?.totalDownloads ?? 124}</span>
                                    <p className="text-[11px] text-slate-400 mt-2">Conteo general de descargas registradas</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 shadow-lg">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Ejecuciones / Aperturas</span>
                                    <span className="text-4xl font-black text-purple-400">{demoStats?.totalProjectLaunches ?? 1}</span>
                                    <p className="text-[11px] text-slate-400 mt-2">Sesiones locales iniciadas en esta instalación</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-lg">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Versión Instalada</span>
                                    <span className="text-4xl font-black text-emerald-400">v{demoStats?.version ?? '1.1.0'}</span>
                                    <p className="text-[11px] text-slate-400 mt-2">Edición Sudamérica (Multipaís & Tax Preset)</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    <strong>Ubicación del Archivo de Persistencia Local:</strong><br />
                                    <code className="text-sky-300 bg-black/40 px-2.5 py-1 rounded text-[11px] font-mono border border-white/10 mt-1 inline-block">C:\Users\pdiaz\.atsit-finanzas\demo-downloads-counter.json</code>
                                </p>

                                <a
                                    href="https://www.atsit.cl/#descargas"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all text-xs shrink-0"
                                >
                                    <DownloadCloud size={16} />
                                    Verificar Actualizaciones en atsit.cl
                                </a>
                            </div>
                        </section>
                    </div>
                )}
                {activeTab === 'movimientos' && (
                    <MovementsManager initialMovements={initialMovements} />
                )}
                {activeTab === 'documentos' && (
                    <DocumentsManager initialDocuments={initialDocuments} />
                )}
                {activeTab === 'usuarios' && (
                    <UsersManager initialUsers={initialUsers} />
                )}
            </div>
        </div>
    );
}
