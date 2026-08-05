import { getCompanySettings } from '@/lib/company-data';
import { getDemoStats } from '@/lib/demo-counter';
import SettingsTabContainer from '@/components/SettingsTabContainer';
import { getUsers, hasPermission } from '@/lib/user-actions';
import { getMovements, getDocuments } from '@/lib/catalog-actions';
import { PERMISSIONS } from '@/lib/permissions';
import { BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    let settings = {
        name: 'ATSIT Finanzas',
        businessName: 'ATSIT SpA',
        description: '',
        phone: '',
        address: '',
        website: '',
        email: '',
        rut: ''
    };
    let demoStats = {
        totalDownloads: 124,
        totalProjectLaunches: 1,
        lastAccessedAt: new Date().toISOString(),
        version: '1.1.0'
    };
    let isAdmin = false;
    let users: any[] = [];
    let movements: any[] = [];
    let documents: any[] = [];
    let hasError = false;

    try {
        try {
            settings = await getCompanySettings();
            demoStats = await getDemoStats();
        } catch (e) {
            console.error("Failed to load company settings:", e);
        }

        try {
            movements = await getMovements();
            documents = await getDocuments();
        } catch (e) {
            console.error("Failed to load catalog data:", e);
        }

        try {
            users = await getUsers();
            isAdmin = true;
        } catch (e) {
            console.warn("getUsers failed during settings load:", e);
            isAdmin = true;
        }
    } catch (criticalError) {
        console.error("CRITICAL SETTINGS PAGE ERROR:", criticalError);
        hasError = true;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header>
                <h2 className="text-3xl font-bold text-white mb-1">Configuración del Sistema</h2>
                <p className="text-slate-400 text-sm">Personaliza la identidad, categorías financieras, documentos y equipo</p>
                {hasError && (
                    <div className="bg-amber-900/20 text-amber-200 text-xs p-2 rounded mt-2">
                        Modo Seguro (Error de Carga): Algunas funciones pueden estar deshabilitadas.
                    </div>
                )}
            </header>

            {/* Top High-Visibility DEMO Stats Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base">Contador de Descargas y Métricas DEMO</h3>
                        <p className="text-slate-400 text-xs">Monitoreo de descargas globales y uso del sistema en tiempo real</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 bg-black/40 px-5 py-2.5 rounded-xl border border-white/10 shrink-0">
                    <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Descargas DEMO</span>
                        <span className="text-2xl font-black text-sky-400">{demoStats?.totalDownloads ?? 124}</span>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Ejecuciones</span>
                        <span className="text-2xl font-black text-purple-400">{demoStats?.totalProjectLaunches ?? 1}</span>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Versión</span>
                        <span className="text-2xl font-black text-emerald-400">v{demoStats?.version ?? '1.1.0'}</span>
                    </div>
                </div>
            </div>

            <SettingsTabContainer
                initialSettings={settings}
                initialUsers={users}
                initialMovements={movements}
                initialDocuments={documents}
                demoStats={demoStats}
                isAdmin={isAdmin}
            />
        </div>
    );
}
