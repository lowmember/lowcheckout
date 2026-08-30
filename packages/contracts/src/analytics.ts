/** Granularidade da série (RF-ANL-04): horária dentro de um dia, diária no resto. */
export const ANALYTICS_GRANULARITIES = ["hour", "day"] as const;
export type AnalyticsGranularity = (typeof ANALYTICS_GRANULARITIES)[number];

/** Recorte efetivamente aplicado, devolvido junto de cada resposta. */
export interface AnalyticsPeriodInfo {
  from: string;
  to: string;
  timeZone: string;
}

export interface AnalyticsOverview {
  period: AnalyticsPeriodInfo;
  revenueInCents: number;
  /**
   * Soma dos pedidos pendentes do período — a linha "+ R$ X pendentes" do card.
   * Não entra em `revenueInCents` nem no ticket médio (RF-ANL-02).
   */
  pendingRevenueInCents: number;
  /** Faturamento ÷ pedidos pagos, arredondado ao centavo. Zero sem vendas. */
  averageTicketInCents: number;
  currency: string;
  sales: {
    approved: number;
    pending: number;
    expired: number;
  };
}

export interface SalesSeriesPoint {
  /** ISO 8601 do início do balde, em UTC. */
  bucket: string;
  revenueInCents: number;
  ordersCount: number;
}

export interface SalesSeries {
  period: AnalyticsPeriodInfo;
  granularity: AnalyticsGranularity;
  currency: string;
  points: SalesSeriesPoint[];
}

export interface TopCheckout {
  checkoutId: string;
  internalTitle: string;
  displayName: string;
  revenueInCents: number;
  ordersCount: number;
}

export interface TopCheckouts {
  period: AnalyticsPeriodInfo;
  currency: string;
  items: TopCheckout[];
}
