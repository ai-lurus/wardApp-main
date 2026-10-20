// Formats a number as MXN currency, e.g. 1234.5 -> "$1,234.50"
export const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
