'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';
import { saveCompanySettings, CompanySettings, SOUTH_AMERICA_PRESETS } from './company-data';

export async function uploadLogo(formData: FormData) {
    const file = formData.get('logo') as File;

    if (!file) {
        return { success: false, message: 'No file uploaded' };
    }

    if (!file.type.startsWith('image/')) {
        return { success: false, message: 'File must be an image' };
    }

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to public directory (both logo.png and logo-pdf.png for full compatibility)
        const pathLogo = join(process.cwd(), 'public', 'logo.png');
        const pathPdfLogo = join(process.cwd(), 'public', 'logo-pdf.png');
        await writeFile(pathLogo, buffer);
        await writeFile(pathPdfLogo, buffer);

        revalidatePath('/', 'layout');
        return { success: true, message: 'Logo actualizado correctamente' };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, message: 'Error al guardar logo' };
    }
}

export async function saveCompanyDetails(formData: FormData) {
    const country = (formData.get('country') as string) || 'Chile';
    const vatRatePercent = parseFloat(formData.get('vatRatePercent') as string);
    const honorariumRatePercent = parseFloat(formData.get('honorariumRatePercent') as string);

    const settings: Partial<CompanySettings> = {
        name: (formData.get('name') as string) || 'ATSIT Finanzas',
        businessName: formData.get('businessName') as string,
        rut: formData.get('rut') as string,
        address: formData.get('address') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        website: formData.get('website') as string,
        description: formData.get('description') as string,
        country: country,
        currency: (formData.get('currency') as string) || 'CLP',
        currencySymbol: (formData.get('currencySymbol') as string) || '$',
        locale: (formData.get('locale') as string) || 'es-CL',
        vatRate: !isNaN(vatRatePercent) ? vatRatePercent / 100 : 0.19,
        honorariumRate: !isNaN(honorariumRatePercent) ? honorariumRatePercent / 100 : 0.1525,
        honorariumTaxMode: ((formData.get('honorariumTaxMode') as string) === 'gross_based' ? 'gross_based' : 'net_based'),
        taxName: (formData.get('taxName') as string) || 'IVA',
        taxReportName: (formData.get('taxReportName') as string) || 'Formulario F29',
        isConfigured: true
    };

    const res = await saveCompanySettings(settings);

    if (res.success) {
        revalidatePath('/', 'layout');
        return { success: true, message: 'Configuración de empresa y tributación guardada correctamente' };
    }

    return { success: false, message: res.error || 'Error al guardar cambios' };
}

export async function completeInitialSetupAction(countryName: string, vatPercent?: number, honorariumPercent?: number) {
    const preset = SOUTH_AMERICA_PRESETS[countryName] || SOUTH_AMERICA_PRESETS['Chile'];

    const vatRate = vatPercent !== undefined && !isNaN(vatPercent) ? vatPercent / 100 : preset.vatRate;
    const honorariumRate = honorariumPercent !== undefined && !isNaN(honorariumPercent) ? honorariumPercent / 100 : preset.honorariumRate;

    const settings: Partial<CompanySettings> = {
        ...preset,
        vatRate,
        honorariumRate,
        isConfigured: true
    };

    const res = await saveCompanySettings(settings);

    if (res.success) {
        revalidatePath('/', 'layout');
        return { success: true, message: `Configuración inicial completada para ${countryName}` };
    }

    return { success: false, message: 'Error al completar la configuración inicial' };
}
