'use client';

import { Download, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';


export interface ColumnDef {
    header: string;
    key: string;
    format?: 'currency' | 'date';
}

const formatValue = (val: any, format?: string) => {
    if (val === null || val === undefined) return '';
    if (format === 'currency') {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
    }
    if (format === 'date') {
        return new Date(val).toLocaleDateString('es-CL');
    }
    return val;
};

export interface SummaryItem {
    label: string;
    value: string | number;
}

interface ExportButtonsProps {
    data: any[];
    columns: ColumnDef[];
    fileName: string;
    title: string;
    summary?: SummaryItem[];
    companyName?: string;
}

export default function ExportButtons({ data, columns, fileName, title, summary, companyName = 'Sistema Financiero' }: ExportButtonsProps) {

    const handleExcelExport = () => {
        // Prepare data for Excel
        const excelData = data.map(item => {
            const row: Record<string, any> = {};
            columns.forEach(col => {
                const val = item[col.key];
                row[col.header] = formatValue(val, col.format);
            });
            return row;
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Add Summary if exists
        if (summary && summary.length > 0) {
            XLSX.utils.sheet_add_aoa(worksheet, [['', '']], { origin: -1 }); // Empty row
            XLSX.utils.sheet_add_aoa(worksheet, [['RESUMEN FINANCIERO', '']], { origin: -1 }); // Header

            summary.forEach(item => {
                XLSX.utils.sheet_add_aoa(worksheet, [[item.label, item.value]], { origin: -1 });
            });
        }

        // Auto-width columns
        const wscols = columns.map(col => ({ wch: col.header.length + 10 }));
        worksheet['!cols'] = wscols;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja 1');
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    const handlePdfExport = async () => {
        const jsPDF = (await import('jspdf')).default;
        const autoTable = (await import('jspdf-autotable')).default;
        const doc = new jsPDF();

        // Helper to load image
        const loadImage = (url: string): Promise<string | null> => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = url;
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        resolve(canvas.toDataURL('image/png'));
                    } else {
                        resolve(null);
                    }
                };
                img.onerror = () => resolve(null);
            });
        };

        const logoDataUrl = await loadImage(`/logo.png?v=${Date.now()}`);

        if (logoDataUrl) {
            doc.addImage(logoDataUrl, 'PNG', 14, 8, 38, 20);
            doc.setFontSize(18);
            doc.text(title, 56, 20);
            doc.setFontSize(9);
            doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 56, 27);
        } else {
            doc.setFontSize(12);
            doc.text(companyName, 14, 20);
            doc.setFontSize(18);
            doc.text(title, 14, 28);
            doc.setFontSize(9);
            doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 14, 35);
        }

        // Table Data
        const tableBody = data.map(item => {
            return columns.map(col => {
                const val = item[col.key];
                return formatValue(val, col.format);
            });
        });

        const tableHead = [columns.map(col => col.header)];

        autoTable(doc, {
            head: tableHead,
            body: tableBody,
            startY: 50,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66] }, // Dark grey
            styles: { fontSize: 8 },
        });

        // Add Summary if exists
        if (summary && summary.length > 0) {
            const finalY = (doc as any).lastAutoTable.finalY + 10;

            autoTable(doc, {
                head: [['RESUMEN FINANCIERO', 'MONTO']],
                body: summary.map(s => [s.label, s.value]),
                startY: finalY,
                theme: 'grid',
                headStyles: { fillColor: [40, 40, 40] },
                styles: { fontSize: 10, fontStyle: 'bold' },
                columnStyles: {
                    0: { cellWidth: 100 },
                    1: { cellWidth: 50, halign: 'right' }
                }
            });
        }

        doc.save(`${fileName}.pdf`);
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleExcelExport}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
            >
                <Download size={18} />
                Excel
            </button>
            <button
                onClick={handlePdfExport}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
            >
                <FileText size={18} />
                PDF
            </button>
        </div>
    );
}
