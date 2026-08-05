export interface CountryPreset {
    country: string;
    currency: string;
    currencySymbol: string;
    locale: string;
    vatRate: number;          // Decimal, e.g. 0.19 for 19%
    honorariumRate: number;   // Decimal, e.g. 0.1525 for 15.25%
    honorariumTaxMode: 'net_based' | 'gross_based';
    taxName: string;          // e.g. 'IVA', 'IGV'
    taxReportName: string;    // e.g. 'F29', 'Declaración IVA'
}

export const SOUTH_AMERICA_PRESETS: Record<string, CountryPreset> = {
    'Chile': {
        country: 'Chile',
        currency: 'CLP',
        currencySymbol: '$',
        locale: 'es-CL',
        vatRate: 0.19,
        honorariumRate: 0.1525,
        honorariumTaxMode: 'net_based',
        taxName: 'IVA',
        taxReportName: 'Formulario F29'
    },
    'Argentina': {
        country: 'Argentina',
        currency: 'ARS',
        currencySymbol: '$',
        locale: 'es-AR',
        vatRate: 0.21,
        honorariumRate: 0.10,
        honorariumTaxMode: 'gross_based',
        taxName: 'IVA',
        taxReportName: 'Declaración IVA'
    },
    'Perú': {
        country: 'Perú',
        currency: 'PEN',
        currencySymbol: 'S/',
        locale: 'es-PE',
        vatRate: 0.18,
        honorariumRate: 0.08,
        honorariumTaxMode: 'gross_based',
        taxName: 'IGV',
        taxReportName: 'Declaración IGV'
    },
    'Colombia': {
        country: 'Colombia',
        currency: 'COP',
        currencySymbol: '$',
        locale: 'es-CO',
        vatRate: 0.19,
        honorariumRate: 0.10,
        honorariumTaxMode: 'gross_based',
        taxName: 'IVA',
        taxReportName: 'IVA / ReteFuente'
    },
    'Ecuador': {
        country: 'Ecuador',
        currency: 'USD',
        currencySymbol: '$',
        locale: 'es-EC',
        vatRate: 0.15,
        honorariumRate: 0.08,
        honorariumTaxMode: 'gross_based',
        taxName: 'IVA',
        taxReportName: 'Declaración IVA'
    },
    'Bolivia': {
        country: 'Bolivia',
        currency: 'BOB',
        currencySymbol: 'Bs',
        locale: 'es-BO',
        vatRate: 0.13,
        honorariumRate: 0.125,
        honorariumTaxMode: 'gross_based',
        taxName: 'IVA',
        taxReportName: 'Declaración IVA'
    },
    'Uruguay': {
        country: 'Uruguay',
        currency: 'UYU',
        currencySymbol: '$',
        locale: 'es-UY',
        vatRate: 0.22,
        honorariumRate: 0.07,
        honorariumTaxMode: 'gross_based',
        taxName: 'IVA',
        taxReportName: 'Declaración IVA'
    },
    'Paraguay': {
        country: 'Paraguay',
        currency: 'PYG',
        currencySymbol: '₲',
        locale: 'es-PY',
        vatRate: 0.10,
        honorariumRate: 0.045,
        honorariumTaxMode: 'gross_based',
        taxName: 'IVA',
        taxReportName: 'Declaración IVA'
    },
    'Brasil': {
        country: 'Brasil',
        currency: 'BRL',
        currencySymbol: 'R$',
        locale: 'pt-BR',
        vatRate: 0.18,
        honorariumRate: 0.015,
        honorariumTaxMode: 'gross_based',
        taxName: 'Impostos',
        taxReportName: 'Impostos de Renda'
    },
    'Venezuela': {
        country: 'Venezuela',
        currency: 'VES',
        currencySymbol: 'Bs',
        locale: 'es-VE',
        vatRate: 0.16,
        honorariumRate: 0.03,
        honorariumTaxMode: 'gross_based',
        taxName: 'IVA',
        taxReportName: 'Declaración IVA'
    }
};
