interface CurrencyFormatOptions {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}

const DEFAULT_LOCALE = 'vi-VN';
const DEFAULT_CURRENCY = 'VND';

// Create default formatter
const defaultFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

/**
 * Format number to currency (VND)
 * @param amount - Amount to format
 * @returns Formatted currency string (e.g., "10.000.000 ₫")
 */
export const formatCurrency = (amount: number): string => {
    return defaultFormatter.format(amount);
};

/**
 * Format number to currency with custom options
 * @param amount - Amount to format
 * @param options - Custom format options
 * @returns Formatted currency string
 */
export const formatCurrencyWithOptions = (amount: number, options?: CurrencyFormatOptions): string => {
    const customFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
        style: 'currency',
        currency: DEFAULT_CURRENCY,
        minimumFractionDigits: options?.minimumFractionDigits ?? 0,
        maximumFractionDigits: options?.maximumFractionDigits ?? 0,
    });
    return customFormatter.format(amount);
};

/**
 * Format number to compact currency (K, Tr, Tỷ)
 * @param amount - Amount to format
 * @returns Compact currency string (e.g., "10Tr", "1,5Tỷ")
 */
export const formatCompactCurrency = (amount: number): string => {
    if (amount >= 1_000_000_000) {
        return `${(amount / 1_000_000_000).toFixed(1).replace('.', ',')}Tỷ`;
    }
    if (amount >= 1_000_000) {
        return `${(amount / 1_000_000).toFixed(1).replace('.', ',')}Tr`;
    }
    if (amount >= 1_000) {
        return `${(amount / 1_000).toFixed(1).replace('.', ',')}K`;
    }
    return defaultFormatter.format(amount);
};

/**
 * Format currency range
 * @param min - Minimum amount
 * @param max - Maximum amount
 * @returns Currency range string (e.g., "10.000.000 ₫ - 20.000.000 ₫")
 */
export const formatCurrencyRange = (min: number, max: number): string => {
    return `${defaultFormatter.format(min)} - ${defaultFormatter.format(max)}`;
};

/**
 * Format compact currency range
 * @param min - Minimum amount
 * @param max - Maximum amount
 * @returns Compact currency range string (e.g., "10Tr - 20Tr")
 */
export const formatCompactCurrencyRange = (min: number, max: number): string => {
    return `${formatCompactCurrency(min)} - ${formatCompactCurrency(max)}`;
};

/**
 * Get currency symbol
 * @returns Currency symbol (₫)
 */
export const getCurrencySymbol = (): string => {
    const parts = defaultFormatter.formatToParts(0);
    const currencyPart = parts.find((part) => part.type === 'currency');
    return currencyPart?.value || '₫';
};

/**
 * Parse currency string to number
 * @param currencyString - Currency string to parse
 * @returns Parsed number
 */
export const parseCurrency = (currencyString: string): number => {
    // Remove currency symbol, spaces, and dots (thousand separators)
    const numericString = currencyString.replace(/[₫\s.]/g, '').replace(/,/g, '.');
    return Number.parseFloat(numericString) || 0;
};

/**
 * Format salary range string
 * @param salaryRange - Salary range string (e.g., "10000000-20000000")
 * @returns Formatted salary range (e.g., "10Tr - 20Tr")
 */
export const formatSalaryRange = (salaryRange: string): string => {
    const [min, max] = salaryRange.split('-').map((s) => Number.parseInt(s.trim()));

    if (!min || !max) {
        return 'Thỏa thuận';
    }

    return formatCompactCurrencyRange(min, max);
};

/**
 * Format number with thousand separators (,)
 * @param value - Number to format
 * @returns Formatted string (e.g., "27,054", "1,000,000")
 */
export const formatNumberWithComma = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
};

// Export constants
export const LOCALE = DEFAULT_LOCALE;
export const CURRENCY = DEFAULT_CURRENCY;
