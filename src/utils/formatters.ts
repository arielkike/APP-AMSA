/**
 * Formatea montos en USD o NIO con separador de miles y dos decimales
 * Ej: 12500 -> "$12,500.00"
 */
export function formatCurrency(amount: number | undefined | null, currency: string = 'USD'): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0.00';
  }

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return currency === 'NIO' ? `C$ ${formatted}` : `$${formatted}`;
}

/**
 * Formatea fechas a formato legible en español (ej: "28 Oct 2026")
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'N/A';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return new Intl.DateTimeFormat('es-NI', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
    }
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-NI', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Formatea cédula nicaragüense al formato 000-000000-0000A
 */
export function formatCedula(input: string): string {
  const clean = input.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
  if (clean.length <= 3) return clean;
  if (clean.length <= 9) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return `${clean.slice(0, 3)}-${clean.slice(3, 9)}-${clean.slice(9, 14)}`;
}
