const LOCALE = 'pt-BR';

export function formatNumber(value: number, digits = 2): string {
  return value.toLocaleString(LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPercent(value: number, digits = 0): string {
  return `${formatNumber(value, digits)}%`;
}

export function formatSigned(value: number, digits = 0): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${formatNumber(Math.abs(value), digits)}`;
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDayMonth(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit' });
}

export function formatFullDate(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatLongDate(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatWeekday(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString(LOCALE, { weekday: 'short' }).replace('.', '');
}
