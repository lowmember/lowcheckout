/**
 * Datas de calendário no formato `yyyy-mm-dd`, sem fuso.
 *
 * O seletor de período troca dias, não instantes: usar `Date` com UTC aqui faria
 * "hoje" virar ontem à noite dependendo do fuso do navegador. Por isso a
 * aritmética acontece sobre `Date` local e a serialização é manual.
 */
export interface CalendarDay {
  year: number;
  /** 0-11, como em `Date`. */
  month: number;
  day: number;
}

export function toIsoDate({ year, month, day }: CalendarDay) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function todayIsoDate() {
  const now = new Date();
  return toIsoDate({ year: now.getFullYear(), month: now.getMonth(), day: now.getDate() });
}

export function parseIsoDate(value: string): CalendarDay | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return null;

  const [, year, month, day] = match;
  return { year: Number(year), month: Number(month) - 1, day: Number(day) };
}

/** `01/09/2026` — o formato que o painel usa em toda data curta. */
export function formatIsoDateToBr(value: string) {
  const parsed = parseIsoDate(value);

  if (!parsed) return value;

  return `${String(parsed.day).padStart(2, "0")}/${String(parsed.month + 1).padStart(2, "0")}/${parsed.year}`;
}

export function addMonths(year: number, month: number, amount: number) {
  const date = new Date(year, month + amount, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * As 6 semanas do mês, completadas com os dias vizinhos — grade fixa evita o
 * calendário "pular de altura" ao trocar de mês.
 */
export function buildMonthGrid(year: number, month: number): CalendarDay[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const start = new Date(year, month, 1 - firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
  });
}
