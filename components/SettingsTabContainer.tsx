'use client';

import { useState } from 'react';
import { Building2, Tag, FileText, Users } from 'lucide-react';
import SettingsForm from './SettingsForm';
import UsersManager from './UsersManager';
import MovementsManager from './MovementsManager';
import DocumentsManager from './DocumentsManager';

type Tab = 'empresa' | 'movimientos' | 'documentos' | 'usuarios';

interface SettingsTabContainerProps {
    initialSettings: any;
    initialUsers: any[];
    initialMovements: any[];
    initialDocuments: any[];
    isAdmin: boolean;
}

export default function SettingsTabContainer({
    initialSettings,
    initialUsers,
    initialMovements,
    initialDocuments,
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
                {isAdmin && (
                    <button
                        onClick={() => setActiveTab('usuarios')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'usuarios' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                    >
                        <Users size={16} />
                        Gestión de Usuarios ({initialUsers.length})
                    </button>
                )}
            </div>

            {/* Tab Contents */}
            <div className="pt-2">
                {activeTab === 'empresa' && (
                    <SettingsForm initialSettings={initialSettings} />
                )}
                {activeTab === 'movimientos' && (
                    <MovementsManager initialMovements={initialMovements} />
                )}
                {activeTab === 'documentos' && (
                    <DocumentsManager initialDocuments={initialDocuments} />
                )}
                {activeTab === 'usuarios' && isAdmin && (
                    <UsersManager initialUsers={initialUsers} />
                )}
            </div>
        </div>
    );
}
