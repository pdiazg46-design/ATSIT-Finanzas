'use client';

import { Download, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SummaryItem } from '@/components/ExportButtons';

// We define minimal interfaces matching what F29 page provides
interface F29Row {
    id: number;
    title: string | null;
    docNumber: string | null;
    netValue: number | null;
    taxValue: number | null;
    projectName: string | null;
    totalValue: number | null;
}

interface ExportF29ButtonsProps {
    fileName: string;
    title: string;
    summary: SummaryItem[];
    salesData: F29Row[];
    purchasesData: F29Row[];
    honorariumData: F29Row[];
    ppmData: F29Row[];
}

const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
};

export default function ExportF29Buttons({
    fileName,
    title,
    summary,
    salesData,
    purchasesData,
    honorariumData,
    ppmData
}: ExportF29ButtonsProps) {

    const handleExcelExport = () => {
        const workbook = XLSX.utils.book_new();

        // 1. SUMMARY SHEET
        if (summary && summary.length > 0) {
            const sumData = [
                ['RESUMEN FINANCIERO', 'MONTO'],
                ...summary.map(item => [item.label, item.value])
            ];
            const sumSheet = XLSX.utils.aoa_to_sheet(sumData);
            sumSheet['!cols'] = [{ wch: 40 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(workbook, sumSheet, 'Resumen');
        }

        // Helper to format flat data for tables
        const createTableSheet = (data: F29Row[], headers: string[], rowMapper: (row: F29Row) => any[]) => {
            const sheetData = [headers, ...data.map(rowMapper)];
            const sheet = XLSX.utils.aoa_to_sheet(sheetData);
            sheet['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 5, 15) }));
            return sheet;
        };

        // 2. VENTAS SHEET
        if (salesData.length > 0) {
            const headers = ['Doc', 'Proyecto', 'Concepto', 'Neto', 'IVA', 'Total Bruto'];
            const sheet = createTableSheet(salesData, headers, (t) => [
                `#${t.docNumber || 'S/N'}`,
                t.projectName || '',
                t.title || '',
                t.netValue || 0,
                t.taxValue || 0,
                t.totalValue || 0
            ]);
            
            // Add Total Row
            const sumNet = salesData.reduce((acc, t) => acc + (t.netValue || 0), 0);
            const sumTax = salesData.reduce((acc, t) => acc + (t.taxValue || 0), 0);
            const sumTotal = salesData.reduce((acc, t) => acc + (t.totalValue || 0), 0);
            XLSX.utils.sheet_add_aoa(sheet, [['TOTALES', '', '', sumNet, sumTax, sumTotal]], { origin: -1 });
            
            XLSX.utils.book_append_sheet(workbook, sheet, 'Ventas (Debito)');
        }

        // 3. COMPRAS SHEET
        if (purchasesData.length > 0) {
            const headers = ['Doc', 'Proyecto', 'Concepto', 'Neto', 'IVA', 'Total Bruto'];
            const sheet = createTableSheet(purchasesData, headers, (t) => [
                `#${t.docNumber || 'S/N'}`,
                t.projectName || '',
                t.title || '',
                Math.abs(t.netValue || 0),
                Math.abs(t.taxValue || 0),
                Math.abs(t.totalValue || 0)
            ]);
            
            // Add Total Row
            const sumNet = Math.abs(purchasesData.reduce((acc, t) => acc + (t.netValue || 0), 0));
            const sumTax = Math.abs(purchasesData.reduce((acc, t) => acc + (t.taxValue || 0), 0));
            const sumTotal = Math.abs(purchasesData.reduce((acc, t) => acc + (t.totalValue || 0), 0));
            XLSX.utils.sheet_add_aoa(sheet, [['TOTALES', '', '', sumNet, sumTax, sumTotal]], { origin: -1 });

            XLSX.utils.book_append_sheet(workbook, sheet, 'Compras (Credito)');
        }

        // 4. HONORARIOS SHEET
        if (honorariumData.length > 0) {
            const headers = ['Doc', 'Proyecto', 'Concepto', 'Líquido', 'Retención', 'Total Bruto'];
            const sheet = createTableSheet(honorariumData, headers, (t) => [
                `#${t.docNumber || 'S/N'}`,
                t.projectName || '',
                t.title || '',
                Math.abs(t.netValue || 0),
                Math.abs(t.taxValue || 0),
                Math.abs(t.totalValue || 0)
            ]);
            
            // Add Total Row
            const sumNet = Math.abs(honorariumData.reduce((acc, t) => acc + (t.netValue || 0), 0));
            const sumTax = Math.abs(honorariumData.reduce((acc, t) => acc + (t.taxValue || 0), 0));
            const sumTotal = Math.abs(honorariumData.reduce((acc, t) => acc + (t.totalValue || 0), 0));
            XLSX.utils.sheet_add_aoa(sheet, [['TOTALES', '', '', sumNet, sumTax, sumTotal]], { origin: -1 });

            XLSX.utils.book_append_sheet(workbook, sheet, 'Honorarios (Retencion)');
        }

        // 5. PPM SHEET
        if (ppmData.length > 0) {
            const headers = ['Doc', 'Proyecto', 'Concepto', 'Monto Pagado'];
            const sheet = createTableSheet(ppmData, headers, (t) => [
                `#${t.docNumber || 'S/N'}`,
                t.projectName || '',
                t.title || '',
                Math.abs(t.totalValue || 0)
            ]);
            
            // Add Total Row
            const sumTotal = Math.abs(ppmData.reduce((acc, t) => acc + (t.totalValue || 0), 0));
            XLSX.utils.sheet_add_aoa(sheet, [['TOTALES', '', '', sumTotal]], { origin: -1 });

            XLSX.utils.book_append_sheet(workbook, sheet, 'PPM Pagado');
        }

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
                head: [['RESUMEN FINANCIERO', 'MONTO']],
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

        // Helper for tables
        const addTableSection = (titleStr: string, data: F29Row[], headers: string[], dataMapper: (row: F29Row) => string[], isTotalRow?: boolean, totalsData?: string[]) => {
            if (data.length === 0) return;
            
            // Check page break
            if (currentY > 250) {
                doc.addPage();
                currentY = 20;
            }

            doc.setFontSize(12);
            doc.text(titleStr, 14, currentY);
            currentY += 5;

            const bodyData = data.map(dataMapper);
            if (totalsData) {
                bodyData.push(totalsData); // Append totals row at the end of body
            }

            autoTable(doc, {
                head: [headers],
                body: bodyData,
                startY: currentY,
                theme: 'grid',
                headStyles: { fillColor: [66, 66, 66] },
                styles: { fontSize: 8 },
                willDrawCell: function(data) {
                    // Make the last row bold if totalsData exists
                    if (totalsData && data.row.index === bodyData.length - 1) {
                        doc.setFont('helvetica', 'bold');
                    }
                }
            });
            currentY = (doc as any).lastAutoTable.finalY + 15;
        };

        // --- VENTAS ---
        if (salesData.length > 0) {
             const sumNet = salesData.reduce((acc, t) => acc + (t.netValue || 0), 0);
             const sumTax = salesData.reduce((acc, t) => acc + (t.taxValue || 0), 0);
             const sumTotal = salesData.reduce((acc, t) => acc + (t.totalValue || 0), 0);

             addTableSection(
                 'Detalle Ventas (Débito)',
                 salesData,
                 ['Doc', 'Proyecto', 'Concepto', 'Neto', 'IVA', 'Total Bruto'],
                 (t) => [
                     `#${t.docNumber || 'S/N'}`,
                     t.projectName || '',
                     t.title || '',
                     formatCurrency(t.netValue),
                     formatCurrency(t.taxValue),
                     formatCurrency(t.totalValue)
                 ],
                 true,
                 ['TOTALES', '', '', formatCurrency(sumNet), formatCurrency(sumTax), formatCurrency(sumTotal)]
             );
        }

        // --- COMPRAS ---
         if (purchasesData.length > 0) {
             const sumNet = Math.abs(purchasesData.reduce((acc, t) => acc + (t.netValue || 0), 0));
             const sumTax = Math.abs(purchasesData.reduce((acc, t) => acc + (t.taxValue || 0), 0));
             const sumTotal = Math.abs(purchasesData.reduce((acc, t) => acc + (t.totalValue || 0), 0));

             addTableSection(
                 'Detalle Compras (Crédito)',
                 purchasesData,
                 ['Doc', 'Proyecto', 'Concepto', 'Neto', 'IVA', 'Total Bruto'],
                 (t) => [
                     `#${t.docNumber || 'S/N'}`,
                     t.projectName || '',
                     t.title || '',
                     formatCurrency(Math.abs(t.netValue || 0)),
                     formatCurrency(Math.abs(t.taxValue || 0)),
                     formatCurrency(Math.abs(t.totalValue || 0))
                 ],
                 true,
                 ['TOTALES', '', '', formatCurrency(sumNet), formatCurrency(sumTax), formatCurrency(sumTotal)]
             );
        }

        // --- HONORARIOS ---
        if (honorariumData.length > 0) {
             const sumNet = Math.abs(honorariumData.reduce((acc, t) => acc + (t.netValue || 0), 0));
             const sumTax = Math.abs(honorariumData.reduce((acc, t) => acc + (t.taxValue || 0), 0));
             const sumTotal = Math.abs(honorariumData.reduce((acc, t) => acc + (t.totalValue || 0), 0));

             addTableSection(
                 'Detalle Honorarios (Retención)',
                 honorariumData,
                 ['Doc', 'Proyecto', 'Concepto', 'Líquido', 'Retención', 'Total Bruto'],
                 (t) => [
                     `#${t.docNumber || 'S/N'}`,
                     t.projectName || '',
                     t.title || '',
                     formatCurrency(Math.abs(t.netValue || 0)),
                     formatCurrency(Math.abs(t.taxValue || 0)),
                     formatCurrency(Math.abs(t.totalValue || 0))
                 ],
                 true,
                 ['TOTALES', '', '', formatCurrency(sumNet), formatCurrency(sumTax), formatCurrency(sumTotal)]
             );
        }

        // --- PPM ---
        if (ppmData.length > 0) {
             const sumTotal = Math.abs(ppmData.reduce((acc, t) => acc + (t.totalValue || 0), 0));

             addTableSection(
                 'Detalle PPM Pagado',
                 ppmData,
                 ['Doc', 'Proyecto', 'Concepto', 'Monto Pagado'],
                 (t) => [
                     `#${t.docNumber || 'S/N'}`,
                     t.projectName || '',
                     t.title || '',
                     formatCurrency(Math.abs(t.totalValue || 0))
                 ],
                 true,
                 ['TOTALES', '', '', formatCurrency(sumTotal)]
             );
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
