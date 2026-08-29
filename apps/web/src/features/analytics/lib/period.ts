import type { AnalyticsPeriod, AnalyticsRange } from "@/features/analytics/types/analytics";

export const DEFAULT_PERIOD: AnalyticsPeriod = "7d";

export const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  today: "Hoje",
  "7d": "7 dias",
  "30d": "30 dias",
  custom: "Personalizado",
};

export const PERIODS = Object.keys(PERIOD_LABELS) as AnalyticsPeriod[];

export function isAnalyticsPeriod(value: unknown): value is AnalyticsPeriod {
  return typeof value === "string" && PERIODS.includes(value as AnalyticsPeriod);
}

/** Parâmetros enviados à API. O período personalizado carrega as duas datas. */
export function toQueryParams(range: AnalyticsRange) {
  if (range.period !== "custom") return { period: range.period };

  return { period: range.period, from: range.from, to: range.to };
}

/** No período personalizado, a data final não pode ser anterior à inicial (RF-ANL-01). */
export function isValidRange(range: AnalyticsRange) {
  if (range.period !== "custom") return true;
  if (!range.from || !range.to) return false;

  return range.from <= range.to;
}

export function describeRange(range: AnalyticsRange) {
  if (range.period !== "custom") return PERIOD_LABELS[range.period];
  if (!range.from || !range.to) return "Período personalizado";

  const format = (value: string) => value.split("-").reverse().join("/");
  return `${format(range.from)} a ${format(range.to)}`;
}
