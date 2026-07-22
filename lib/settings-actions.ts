'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';

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
        return { success: true, message: 'Logo updated successfully' };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, message: 'Failed to save logo' };
    }
}

import { saveCompanySettings, CompanySettings } from './company-data';

export async function saveCompanyDetails(formData: FormData) {
    const settings: Partial<CompanySettings> = {
        name: formData.get('name') as string,
        businessName: formData.get('businessName') as string,
        rut: formData.get('rut') as string,
        address: formData.get('address') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        website: formData.get('website') as string,
        description: formData.get('description') as string,
    };

    const res = await saveCompanySettings(settings);

    if (res.success) {
        revalidatePath('/', 'layout');
        return { success: true, message: 'Información actualizada correctamente' };
    }

    return { success: false, message: res.error || 'Error al guardar cambios' };
}
