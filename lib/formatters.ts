import { CompanySettings } from './company-data';

const fallbackSettings: Partial<CompanySettings> = {
    currency: 'CLP',
    locale: 'es-CL',
    vatRate: 0.19,
    honorariumRate: 0.1525,
    taxName: 'IVA',
    taxReportName: 'F29'
};

export function formatCurrency(val: number | null | undefined, settings?: Partial<CompanySettings>): string {
    const amount = val || 0;
    const locale = settings?.locale || fallbackSettings.locale || 'es-CL';
    const currency = settings?.currency || fallbackSettings.currency || 'CLP';

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: currency === 'CLP' || currency === 'PYG' ? 0 : 2
        }).format(amount);
    } catch {
        // Fallback in case of custom/unsupported currency string
        const symbol = settings?.currencySymbol || '$';
        return `${symbol} ${amount.toLocaleString(locale)}`;
    }
}

export function formatTaxPercentage(rateDecimal: number | null | undefined): string {
    if (rateDecimal === null || rateDecimal === undefined) return '0%';
    const pct = rateDecimal * 100;
    return `${Number.isInteger(pct) ? pct : pct.toFixed(2)}%`;
}
