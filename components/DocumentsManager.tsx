'use client';

import { useState } from 'react';
import { FileText, ShieldCheck, Search } from 'lucide-react';

interface DocumentType {
    id: number;
    name: string;
}

export default function DocumentsManager({ initialDocuments }: { initialDocuments: DocumentType[] }) {
    const [documents] = useState<DocumentType[]>(initialDocuments);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = documents.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDocBadge = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('nota de crédito') || lower.includes('nota de credito')) {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">Descuento / Inversión de Signo</span>;
        }
        if (lower.includes('factura') && !lower.includes('exenta')) {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">19% IVA F29</span>;
        }
        if (lower.includes('boleta') && lower.includes('honorario')) {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">15.25% Retención 2° Cat</span>;
        }
        if (lower.includes('boleta') && !lower.includes('exenta')) {
            return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">19% IVA Incluido</span>;
        }
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-500/10 text-slate-400 border border-slate-500/20">Exento / Respaldo</span>;
    };

    return (
        <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="text-sky-400" size={22} />
                        Catálogo Oficial de Documentos Tributarios (Chile SII)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Estructura estandarizada y protegida bajo la normativa del Servicio de Impuestos Internos de Chile
                    </p>
                </div>
                <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 shadow-sm">
                    <ShieldCheck size={16} />
                    Catálogo Protegido
                </span>
            </div>

            <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-xl text-xs text-sky-200 flex items-start gap-3">
                <FileText className="text-sky-400 shrink-0 mt-0.5" size={18} />
                <div>
                    <strong className="block text-sky-300 font-bold mb-0.5">Estandarización Normativa SII Protegida:</strong>
                    Para evitar inconsistencias en el cálculo de impuestos y resguardar la seguridad de tus informes (F29, Libros de IVA y Flujo de Caja), los tipos de documentos tributarios son fijos y oficiales. Los cálculos (19% IVA, 15.25% Retención y Notas de Crédito) operan automáticamente.
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-xs font-bold text-slate-400">
                    Total Documentos tributarios oficiales: <strong className="text-white">{documents.length}</strong>
                </span>
                <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar documento..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                    />
                </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/40">
                <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/5 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/5">
                        <tr>
                            <th className="p-3.5">Nombre del Documento Tributario</th>
                            <th className="p-3.5 text-right">Comportamiento Tributario / F29</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="p-6 text-center text-slate-500">
                                    No se encontraron documentos registrados.
                                </td>
                            </tr>
                        ) : (
                            filtered.map(doc => (
                                <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-3.5 font-medium text-white flex items-center gap-2">
                                        <FileText size={14} className="text-sky-400 shrink-0" />
                                        <span>{doc.name}</span>
                                    </td>
                                    <td className="p-3.5 text-right">
                                        {getDocBadge(doc.name)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
