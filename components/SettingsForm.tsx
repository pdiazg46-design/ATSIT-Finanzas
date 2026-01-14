'use client';

import { useState } from 'react';
import Image from 'next/image';
import { uploadLogo, saveCompanyDetails } from '@/lib/settings-actions';
import { CompanySettings } from '@/lib/company-data';
import { Upload, Save, AlertCircle, CheckCircle2, Building2 } from 'lucide-react';

export default function SettingsForm({ initialSettings }: { initialSettings: CompanySettings }) {
    const [preview, setPreview] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [logoLoading, setLogoLoading] = useState(false);

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
            setPreview(null); // Clear preview to show "saved" state effectively or keep it?
            // Page reload or revalidation will handle the image update
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

            {/* Company Details Section */}
            <section className="glass-card p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Building2 size={24} className="text-sky-400" />
                    Información de la Empresa
                </h3>

                <form onSubmit={handleDetailsSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400">Nombre de Fantasía (App)</label>
                        <input name="name" defaultValue={initialSettings.name} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors" placeholder="Ej: Tangente" />
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
                        <label className="text-sm font-bold text-slate-400">RUT / Identificador Fiscal</label>
                        <input name="rut" defaultValue={initialSettings.rut} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors" />
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
                                    Guardar Información
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
        </div>
    );
}
