/** Seletor único de período que controla a home inteira (RF-ANL-01). */
export type AnalyticsPeriod = "today" | "7d" | "30d" | "custom";

export interface AnalyticsRange {
  period: AnalyticsPeriod;
  /** Só no período personalizado, no formato yyyy-mm-dd. */
  from?: string;
  to?: string;
}

/** Recorte efetivamente aplicado, devolvido pela API junto de cada resposta. */
export interface AnalyticsPeriodInfo {
  from: string;
  to: string;
  timeZone: string;
}

/** `GET /analytics/overview` — RF-ANL-02 e RF-ANL-03. */
export interface AnalyticsOverview {
  period: AnalyticsPeriodInfo;
  currency: string;
  revenueInCents: number;
  /** Soma dos pedidos ainda aguardando pagamento no período. */
  pendingRevenueInCents: number;
  averageTicketInCents: number;
  sales: {
    approved: number;
    pending: number;
    expired: number;
  };
}

export type SalesSeriesGranularity = "day" | "hour";

export interface SalesSeriesPoint {
  /** ISO 8601 do início do balde, em UTC. */
  bucket: string;
  revenueInCents: number;
  ordersCount: number;
}

/** `GET /analytics/sales-series` — RF-ANL-04. */
export interface SalesSeries {
  period: AnalyticsPeriodInfo;
  granularity: SalesSeriesGranularity;
  currency: string;
  points: SalesSeriesPoint[];
}

/** Item do ranking — RF-ANL-05. */
export interface TopCheckout {
  checkoutId: string;
  internalTitle: string;
  displayName: string;
  revenueInCents: number;
  ordersCount: number;
}

/** `GET /analytics/top-checkouts`: o ranking vem embrulhado em `items`. */
export interface TopCheckouts {
  period: AnalyticsPeriodInfo;
  currency: string;
  items: TopCheckout[];
}
