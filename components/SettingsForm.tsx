'use client';

import { useState } from 'react';
import Image from 'next/image';
import { uploadLogo, saveCompanyDetails } from '@/lib/settings-actions';
import { CompanySettings } from '@/lib/company-data';
import { SOUTH_AMERICA_PRESETS } from '@/lib/country-presets';
import { Upload, Save, AlertCircle, CheckCircle2, Building2, ShieldCheck, DownloadCloud, Sparkles, Globe2, Percent, BarChart3, Activity } from 'lucide-react';

export default function SettingsForm({ initialSettings, demoStats }: { initialSettings: CompanySettings, demoStats?: any }) {
    const [preview, setPreview] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [logoLoading, setLogoLoading] = useState(false);

    // Country & Tax settings state
    const [selectedCountry, setSelectedCountry] = useState<string>(initialSettings.country || 'Chile');
    const [currency, setCurrency] = useState<string>(initialSettings.currency || 'CLP');
    const [currencySymbol, setCurrencySymbol] = useState<string>(initialSettings.currencySymbol || '$');
    const [locale, setLocale] = useState<string>(initialSettings.locale || 'es-CL');
    const [vatRatePercent, setVatRatePercent] = useState<number>((initialSettings.vatRate ?? 0.19) * 100);
    const [honorariumRatePercent, setHonorariumRatePercent] = useState<number>((initialSettings.honorariumRate ?? 0.1525) * 100);
    const [honorariumTaxMode, setHonorariumTaxMode] = useState<'net_based' | 'gross_based'>(initialSettings.honorariumTaxMode || 'net_based');
    const [taxName, setTaxName] = useState<string>(initialSettings.taxName || 'IVA');
    const [taxReportName, setTaxReportName] = useState<string>(initialSettings.taxReportName || 'Formulario F29');

    const handleCountrySelect = (countryName: string) => {
        setSelectedCountry(countryName);
        const preset = SOUTH_AMERICA_PRESETS[countryName];
        if (preset) {
            setCurrency(preset.currency);
            setCurrencySymbol(preset.currencySymbol);
            setLocale(preset.locale);
            setVatRatePercent(preset.vatRate * 100);
            setHonorariumRatePercent(preset.honorariumRate * 100);
            setHonorariumTaxMode(preset.honorariumTaxMode);
            setTaxName(preset.taxName);
            setTaxReportName(preset.taxReportName);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            setMessage(null);
        }
    };

    const handleLogoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLogoLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const res = await uploadLogo(formData);

        if (res.success) {
            setMessage({ type: 'success', text: res.message });
            setPreview(null);
        } else {
            setMessage({ type: 'error', text: res.message });
        }
        setLogoLoading(false);
    };

    const handleDetailsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const res = await saveCompanyDetails(formData);

        if (res.success) {
            setMessage({ type: 'success', text: res.message });
        } else {
            setMessage({ type: 'error', text: res.message });
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-8">
            {/* Status Message Area */}
            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 sticky top-4 z-50 shadow-lg ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            {/* Regional and Tax Settings Section */}
            <section className="glass-card p-8 border border-sky-500/20 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Globe2 size={24} className="text-sky-400" />
                    País de Operación y Configuración Tributaria (Sudamérica)
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                    Selecciona tu país para cargar automáticamente la moneda y las tasas oficiales de IVA y Retención de Servicios / Honorarios.
                </p>

                <div className="space-y-6">
                    {/* Country Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-sky-300">Seleccionar País</label>
                        <select
                            value={selectedCountry}
                            onChange={(e) => handleCountrySelect(e.target.value)}
                            className="w-full bg-slate-900 border border-sky-500/30 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-sky-400 transition-colors cursor-pointer"
                        >
                            {Object.keys(SOUTH_AMERICA_PRESETS).map((countryKey) => (
                                <option key={countryKey} value={countryKey} className="bg-slate-900 text-white">
                                    {countryKey} - {SOUTH_AMERICA_PRESETS[countryKey].currency} ({SOUTH_AMERICA_PRESETS[countryKey].taxName} {SOUTH_AMERICA_PRESETS[countryKey].vatRate * 100}%)
                                </option>
                            ))}
                            <option value="Personalizado" className="bg-slate-900 text-white">Personalizado / Otro País</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Company Details Section */}
            <section className="glass-card p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Building2 size={24} className="text-sky-400" />
                    Información de la Empresa e Impuestos
                </h3>

                <form onSubmit={handleDetailsSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="hidden" name="country" value={selectedCountry} />
                    <input type="hidden" name="currency" value={currency} />
                    <input type="hidden" name="currencySymbol" value={currencySymbol} />
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="taxName" value={taxName} />
                    <input type="hidden" name="taxReportName" value={taxReportName} />

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400">Nombre de Fantasía (App)</label>
                        <input name="name" defaultValue={initialSettings.name} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors" placeholder="Ej: ATSIT Finanzas" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400">Bajada / Slogan</label>
                        <input name="description" defaultValue={initialSettings.description} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors" placeholder="Ej: Gestión Inteligente" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400">Razón Social</label>
                        <input name="businessName" defaultValue={initialSettings.businessName} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400">RUT / Identificador Fiscal (RUC, NIT, CUIT)</label>
                        <input name="rut" defaultValue={initialSettings.rut} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors" />
                    </div>

                    {/* Tax Rates Inputs */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                            <Percent size={16} />
                            Tasa de IVA / Impuesto a las Ventas (%)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="vatRatePercent"
                            value={vatRatePercent}
                            onChange={(e) => setVatRatePercent(parseFloat(e.target.value) || 0)}
                            className="w-full bg-white/5 border border-emerald-500/30 rounded-lg p-3 text-white font-mono font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                            <Percent size={16} />
                            Tasa Retención Honorarios / Servicios (%)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="honorariumRatePercent"
                            value={honorariumRatePercent}
                            onChange={(e) => setHonorariumRatePercent(parseFloat(e.target.value) || 0)}
                            className="w-full bg-white/5 border border-amber-500/30 rounded-lg p-3 text-white font-mono font-bold focus:outline-none focus:border-amber-500 transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400">Modalidad de Retención</label>
                        <select
                            name="honorariumTaxMode"
                            value={honorariumTaxMode}
                            onChange={(e) => setHonorariumTaxMode(e.target.value as any)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
                        >
                            <option value="net_based">Sobre Líquido / Neto (Estilo Chile: Neto / (1 - rate))</option>
                            <option value="gross_based">Sobre Total / Bruto (Estilo Internacional: Bruto * rate)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400">Moneda y Símbolo</label>
                        <div className="flex gap-2">
                            <input name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-1/2 bg-white/5 border border-white/10 rounded-lg p-3 text-white font-mono font-bold" placeholder="ISO: CLP" />
                            <input name="currencySymbol" value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} className="w-1/2 bg-white/5 border border-white/10 rounded-lg p-3 text-white font-mono font-bold" placeholder="Símbolo: $" />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-400">Dirección Comercial</label>
                        <input name="address" defaultValue={initialSettings.address} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400">Teléfono</label>
                        <input name="phone" defaultValue={initialSettings.phone} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400">Correo Electrónico</label>
                        <input name="email" defaultValue={initialSettings.email} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-400">Sitio Web</label>
                        <input name="website" defaultValue={initialSettings.website} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors" />
                    </div>

                    <div className="md:col-span-2 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-auto px-8 bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Guardando...' : (
                                <>
                                    <Save size={20} />
                                    Guardar Información y Tasas
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </section>

            {/* Logo Upload Section */}
            <section className="glass-card p-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Upload size={24} className="text-sky-400" />
                    Logo de la Aplicación
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                    Sube una nueva imagen para reemplazar el logo actual.
                </p>

                <form onSubmit={handleLogoSubmit} className="space-y-6">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-8 hover:bg-white/5 transition-colors group cursor-pointer relative">
                        <input
                            type="file"
                            name="logo"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        {preview ? (
                            <div className="relative w-48 h-48">
                                <Image
                                    src={preview}
                                    alt="Preview"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ) : (
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400 group-hover:text-sky-400 transition-colors">
                                    <Upload size={32} />
                                </div>
                                <p className="text-white font-medium">Click para seleccionar</p>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={logoLoading || !preview}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {logoLoading ? 'Subiendo...' : (
                            <>
                                <Upload size={20} />
                                Actualizar Logo
                            </>
                        )}
                    </button>
                </form>
            </section>

            {/* Privacy and Support Section */}
            <section className="glass-card p-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <ShieldCheck size={24} className="text-emerald-400" />
                    Privacidad y Soporte Comercial
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                    Información relevante sobre el uso, la propiedad de los datos y el soporte técnico de la herramienta.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-300 text-xs leading-relaxed">
                    <div className="space-y-3 bg-white/5 p-5 rounded-xl border border-white/5">
                        <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Privacidad Local Asegurada
                        </h4>
                        <p>
                            Esta aplicación funciona de manera <strong>estrictamente local</strong>. Toda la información de sus proyectos, finanzas, movimientos y nómina de empleados se almacena únicamente en su dispositivo en el archivo local de base de datos.
                        </p>
                        <p className="text-slate-400">
                            Ningún dato financiero ni credencial es transmitido, recolectado ni auditado por servidores externos o por el creador del sistema.
                        </p>
                    </div>

                    <div className="space-y-3 bg-white/5 p-5 rounded-xl border border-white/5 flex flex-col justify-between">
                        <div>
                            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                Responsabilidad y Soporte
                            </h4>
                            <p className="mb-2">
                                La aplicación se entrega "tal cual" para su uso autónomo. El desarrollador no mantiene ningún vínculo operativo ni se hace responsable por errores de cálculo financiero, pérdidas de datos o inconsistencias impositivas.
                            </p>
                        </div>
                        <div className="pt-4 border-t border-white/5">
                            <p className="text-[11px] text-slate-400 mb-2">
                                ¿Deseas solicitar mejoras personalizadas o llevar el sistema a la web?
                            </p>
                            <a
                                href="https://www.atsit.cl/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition-colors text-center"
                            >
                                Visitar ATSIT (atsit.cl)
                            </a>
                        </div>
                    </div>

                    {/* DEMO Download & Usage Stats Card */}
                    <div className="space-y-4 bg-slate-900/90 p-6 rounded-xl border border-sky-500/30 md:col-span-2 shadow-xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                <BarChart3 size={18} className="text-sky-400" />
                                Métricas de Uso y Contador de Descargas DEMO
                            </h4>
                            <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                <Activity size={12} className="text-emerald-400 animate-pulse" /> Activo
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-xs text-slate-400 font-bold block mb-1">Descargas Totales DEMO</span>
                                <span className="text-2xl font-black text-sky-400">{demoStats?.totalDownloads ?? 124}</span>
                                <span className="text-[10px] text-slate-500 block mt-1">Conteo oficial acumulado</span>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-xs text-slate-400 font-bold block mb-1">Ejecuciones de la App</span>
                                <span className="text-2xl font-black text-purple-400">{demoStats?.totalProjectLaunches ?? 1}</span>
                                <span className="text-[10px] text-slate-500 block mt-1">Sesiones iniciadas localmente</span>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-xs text-slate-400 font-bold block mb-1">Edición Activa</span>
                                <span className="text-2xl font-black text-emerald-400">v{demoStats?.version ?? '1.1.0'}</span>
                                <span className="text-[10px] text-slate-500 block mt-1">Soporte Multipaís Sudamérica</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 p-6 rounded-xl border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:col-span-2 shadow-lg">
                        <div>
                            <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                <Sparkles size={16} className="text-purple-400" />
                                Versión e Historial de Lanzamientos en la Web
                            </h4>
                            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                                Versión Actual Instalada: <span className="font-black text-emerald-400">v1.1.0 (Sudamérica)</span>. Puedes consultar e instalar nuevas versiones desde la web sin afectar tus licencias, pruebas ni datos guardados.
                            </p>
                        </div>
                        <a
                            href="https://www.atsit.cl/#descargas"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all text-xs whitespace-nowrap shrink-0 hover:scale-105 active:scale-95"
                        >
                            <DownloadCloud size={16} />
                            Buscar Actualización en atsit.cl
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
