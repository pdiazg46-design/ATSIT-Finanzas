'use client';

import { useState } from 'react';
import { Send, FileText } from 'lucide-react';
import { updateProjectObservations } from '@/lib/project-actions';
import { useRouter } from 'next/navigation';

interface Observation {
    author: string;
    date: string;
    content: string;
}

export default function ProjectObservationsManager({
    projectId,
    initialObservations,
    currentUser
}: {
    projectId: number,
    initialObservations: string | null,
    currentUser: any
}) {
    const router = useRouter();
    const [newObservationText, setNewObservationText] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Parsear historial
    const parseHistorial = (rawText: string | null): Observation[] => {
        if (!rawText || rawText.trim() === '') return [];
        try {
            if (rawText.trim().startsWith('[')) {
                const parsed = JSON.parse(rawText);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            // Fallback en caso de que sea texto plano heredado
        }
        return [{
            author: 'Sistema (Migración)',
            date: new Date().toISOString(),
            content: rawText
        }];
    };

    const observations = parseHistorial(initialObservations);

    const handleAddObservation = async () => {
        if (!newObservationText.trim() || isSaving) return;
        setIsSaving(true);

        const newEntry: Observation = {
            author: currentUser?.name || 'Pdiaz',
            date: new Date().toISOString(),
            content: newObservationText.trim()
        };

        const updatedList = [...observations, newEntry];
        const updatedJson = JSON.stringify(updatedList);

        try {
            const res = await updateProjectObservations(projectId, updatedJson);
            if (res && res.success) {
                setNewObservationText('');
                router.refresh();
            } else {
                alert('No se pudo guardar la observación.');
            }
        } catch (e) {
            console.error(e);
            alert('Error al guardar la observación.');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDateStr = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return dateStr;
        }
    };

    const renderSingleObservation = (obs: Observation, idx: number) => {
        const initials = obs.author
            ? obs.author.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
            : 'U';
        
        return (
            <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex gap-4 items-start hover:bg-slate-900/80 transition-all duration-200">
                <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xs font-black text-sky-400 shrink-0">
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-slate-200 tracking-wider uppercase">{obs.author}</span>
                        {obs.date && (
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{formatDateStr(obs.date)}</span>
                        )}
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                        {obs.content}
                    </p>
                </div>
            </div>
        );
    };

    // Orden descendente (más nuevos primero)
    const reversedList = [...observations].reverse();
    const latestObs = reversedList[0];
    const olderObs = reversedList.slice(1);

    return (
        <section className="glass-card p-8 border-sky-500/20 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <FileText size={20} className="text-sky-400" />
                Observaciones del Proyecto
            </h3>

            {/* Redactor de Nueva Observación */}
            <div className="flex gap-3 items-end">
                <textarea
                    value={newObservationText}
                    onChange={(e) => setNewObservationText(e.target.value)}
                    placeholder="Redactar nueva observación del proyecto..."
                    rows={3}
                    className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500 transition-all resize-none custom-scrollbar"
                />
                <button
                    type="button"
                    onClick={handleAddObservation}
                    disabled={!newObservationText.trim() || isSaving}
                    className="p-4 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-sky-500/10 shrink-0 h-[48px]"
                    title="Agregar observación"
                >
                    <Send size={16} />
                </button>
            </div>

            {/* Listado de Observaciones */}
            <div className="space-y-3">
                {latestObs ? (
                    <>
                        {/* Última observación (siempre visible) */}
                        {renderSingleObservation(latestObs, 0)}

                        {/* Historial colapsable si hay observaciones anteriores */}
                        {olderObs.length > 0 && (
                            <details className="group border border-white/5 rounded-xl bg-slate-950/20 overflow-hidden">
                                <summary className="cursor-pointer text-xs font-black text-sky-400 hover:text-sky-300 hover:bg-white/5 transition-all select-none outline-none flex items-center justify-between px-4 py-3">
                                    <span className="tracking-widest uppercase">Historial de observaciones ({olderObs.length})</span>
                                    <svg className="w-4 h-4 transform transition-transform group-open:rotate-180 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </summary>
                                <div className="p-4 space-y-3 border-t border-white/5 bg-slate-900/10 animate-in slide-in-from-top-1 duration-150">
                                    {olderObs.map((obs, idx) => renderSingleObservation(obs, idx + 1))}
                                </div>
                            </details>
                        )}
                    </>
                ) : (
                    <p className="text-slate-500 italic text-sm">No hay observaciones registradas para este proyecto.</p>
                )}
            </div>
        </section>
    );
}
