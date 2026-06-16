interface CurrencyFormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

const DEFAULT_LOCALE = 'vi-VN';
const DEFAULT_CURRENCY = 'VND';

const defaultFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
  style: 'currency',
  currency: DEFAULT_CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatCurrency = (amount: number): string => {
  return defaultFormatter.format(amount);
};

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


