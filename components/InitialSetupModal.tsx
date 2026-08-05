'use client';

import { useState } from 'react';
import { SOUTH_AMERICA_PRESETS } from '@/lib/country-presets';
import { completeInitialSetupAction } from '@/lib/settings-actions';
import { Globe2, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Percent } from 'lucide-react';

export default function InitialSetupModal({ isConfigured }: { isConfigured: boolean }) {
    const [isOpen, setIsOpen] = useState(!isConfigured);
    const [selectedCountry, setSelectedCountry] = useState<string>('Chile');
    const [vatPercent, setVatPercent] = useState<number>(19);
    const [honorariumPercent, setHonorariumPercent] = useState<number>(15.25);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleCountryChange = (countryName: string) => {
        setSelectedCountry(countryName);
        const preset = SOUTH_AMERICA_PRESETS[countryName];
        if (preset) {
            setVatPercent(preset.vatRate * 100);
            setHonorariumPercent(preset.honorariumRate * 100);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const res = await completeInitialSetupAction(selectedCountry, vatPercent, honorariumPercent);
        if (res.success) {
            setIsOpen(false);
        } else {
            alert(res.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-2xl w-full glass-card p-8 rounded-3xl border border-sky-500/30 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/20 via-indigo-500/20 to-purple-500/20 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400 shadow-lg shadow-sky-500/10">
                        <Globe2 size={36} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                        Bienvenido a <span className="premium-gradient-text">ATSIT Finanzas</span>
                    </h2>
                    <p className="text-slate-300 text-sm max-w-md mx-auto">
                        Para garantizar cálculos financieros exactos, por favor selecciona tu <strong>País de Operación</strong> y confirma las tasas de impuestos locales.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Country Selector Grid */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-sky-400 block">
                            1. Selecciona tu País (Sudamérica)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                            {Object.keys(SOUTH_AMERICA_PRESETS).map((countryKey) => {
                                const preset = SOUTH_AMERICA_PRESETS[countryKey];
                                const isSelected = selectedCountry === countryKey;
                                return (
                                    <button
                                        type="button"
                                        key={countryKey}
                                        onClick={() => handleCountryChange(countryKey)}
                                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative ${isSelected
                                                ? 'bg-sky-500/20 border-sky-400 text-white shadow-lg shadow-sky-500/10 scale-[1.02]'
                                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-bold text-sm text-white">{countryKey}</span>
                                            {isSelected && <CheckCircle2 size={16} className="text-sky-400 shrink-0" />}
                                        </div>
                                        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                                            <span>Moneda: <strong className="text-sky-300">{preset.currency} ({preset.currencySymbol})</strong></span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tax Rates Customization */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                <Percent size={14} className="text-emerald-400" />
                                Tasa IVA / Impuesto Venta (%)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={vatPercent}
                                    onChange={(e) => setVatPercent(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3 text-white font-mono font-bold focus:outline-none focus:border-sky-500 text-sm"
                                    required
                                />
                                <span className="absolute right-3 top-3 text-xs text-slate-500 font-bold">%</span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                <Percent size={14} className="text-amber-400" />
                                Retención Honorarios / Servicios (%)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={honorariumPercent}
                                    onChange={(e) => setHonorariumPercent(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3 text-white font-mono font-bold focus:outline-none focus:border-sky-500 text-sm"
                                    required
                                />
                                <span className="absolute right-3 top-3 text-xs text-slate-500 font-bold">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-sky-500/10 border border-sky-500/20 p-3 rounded-xl">
                        <ShieldCheck size={18} className="text-sky-400 shrink-0" />
                        <span>Podrás modificar o ajustar estas tasas en cualquier momento desde la sección de <strong>Configuración</strong>.</span>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-sky-500/20 transition-all flex items-center justify-center gap-2 text-base hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? 'Guardando Preferencias...' : (
                            <>
                                <span>Comenzar a usar ATSIT Finanzas en {selectedCountry}</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
