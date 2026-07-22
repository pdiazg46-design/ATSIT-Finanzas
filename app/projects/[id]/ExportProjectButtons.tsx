'use client';

import { Download, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SummaryItem } from '@/components/ExportButtons';

interface ProjectTaskRow {
    id: number;
    title: string | null;
    docNumber: string | null;
    netValue: number | null;
    taxValue: number | null;
    totalValue: number | null;
    assignedTo: string | null;
    movement: string | null;
    document: string | null;
    startDate: string | null;
    status: string | null;
}

interface ExportProjectButtonsProps {
    fileName: string;
    title: string;
    summary: SummaryItem[];
    tasksData: ProjectTaskRow[];
}

const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
};

export default function ExportProjectButtons({
    fileName,
    title,
    summary,
    tasksData
}: ExportProjectButtonsProps) {

    const handleExcelExport = () => {
        const workbook = XLSX.utils.book_new();

        // 1. SUMMARY SHEET
        if (summary && summary.length > 0) {
            const sumData = [
                ['RESUMEN DEL PROYECTO', 'MONTO'],
                ...summary.map(item => [item.label, item.value])
            ];
            const sumSheet = XLSX.utils.aoa_to_sheet(sumData);
            sumSheet['!cols'] = [{ wch: 40 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(workbook, sumSheet, 'Resumen');
        }

        // 2. TASKS SHEET
        if (tasksData.length > 0) {
            const headers = ['Título', 'Asignado a', 'Movimiento', 'Documento', 'Nº Doc', 'Neto', 'Impuesto', 'Total Bruto', 'Estado', 'Fecha'];
            
            const sheetData = [headers, ...tasksData.map(t => [
                t.title || '',
                t.assignedTo || '',
                t.movement || '',
                t.document || '',
                t.docNumber || 'S/N',
                t.netValue || 0,
                t.taxValue || 0,
                t.totalValue || 0,
                t.status || '',
                t.startDate ? new Date(t.startDate).toLocaleDateString('es-CL') : ''
            ])];
            
            const sheet = XLSX.utils.aoa_to_sheet(sheetData);
            sheet['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 5, 15) }));
            XLSX.utils.book_append_sheet(workbook, sheet, 'Tareas');
        }

        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    const handlePdfExport = async () => {
        const jsPDF = (await import('jspdf')).default;
        const autoTable = (await import('jspdf-autotable')).default;
        const doc = new jsPDF('landscape'); // Landscape is better for so many columns

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
            doc.text(title, 56, 18);
            doc.setFontSize(9);
            doc.text(`Fecha de exportación: ${new Date().toLocaleDateString('es-CL')}`, 56, 25);
        } else {
            doc.setFontSize(18);
            doc.text(title, 14, 18);
            doc.setFontSize(9);
            doc.text(`Fecha de exportación: ${new Date().toLocaleDateString('es-CL')}`, 14, 25);
        }

        let currentY = 40;

        // --- SUMMARY ---
        if (summary && summary.length > 0) {
            autoTable(doc, {
                head: [['RESUMEN DEL PROYECTO', 'MONTO']],
                body: summary.map(s => [s.label, s.value]),
                startY: currentY,
                theme: 'grid',
                headStyles: { fillColor: [40, 40, 40] },
                styles: { fontSize: 10, fontStyle: 'bold' },
                columnStyles: {
                    0: { cellWidth: 120 },
                    1: { cellWidth: 50, halign: 'right' }
                }
            });
            currentY = (doc as any).lastAutoTable.finalY + 15;
        }

        // --- TASKS TABLE ---
        if (tasksData.length > 0) {
            
            // Check page break
            if (currentY > 180) { // Since landscape
                doc.addPage();
                currentY = 20;
            }

            doc.setFontSize(12);
            doc.text('Histórico de Tareas', 14, currentY);
            currentY += 5;

            const bodyData = tasksData.map(t => [
                t.title || '',
                t.assignedTo || '',
                t.movement || '',
                t.document || '',
                t.docNumber || 'S/N',
                formatCurrency(t.netValue),
                formatCurrency(t.taxValue),
                formatCurrency(t.totalValue),
                t.status || '',
                t.startDate ? new Date(t.startDate).toLocaleDateString('es-CL') : ''
            ]);

            autoTable(doc, {
                head: [['Título', 'Asignado a', 'Movimiento', 'Documento', 'Nº Doc', 'Neto', 'Impuesto', 'Total', 'Estado', 'Fecha']],
                body: bodyData,
                startY: currentY,
                theme: 'grid',
                headStyles: { fillColor: [66, 66, 66] },
                styles: { fontSize: 8 },
            });
        }

        doc.save(`${fileName}.pdf`);
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleExcelExport}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
            >
                <Download size={18} />
                Excel
            </button>
            <button
                onClick={handlePdfExport}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
            >
                <FileText size={18} />
                PDF
            </button>
        </div>
    );
}
