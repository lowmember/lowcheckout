/** Recorte efetivamente aplicado, devolvido junto para a home poder exibi-lo. */
export interface AnalyticsPeriodDto {
  from: string;
  to: string;
  timeZone: string;
}

export interface AnalyticsOverviewDto {
  period: AnalyticsPeriodDto;
  revenueInCents: number;
  /**
   * Soma dos pedidos pendentes do período — a linha de apoio "+ R$ X pendentes"
   * do card. Não entra em `revenueInCents` nem no ticket médio (RF-ANL-02).
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

export interface SalesSeriesPointDto {
  bucket: string;
  revenueInCents: number;
  ordersCount: number;
}

export interface SalesSeriesDto {
  period: AnalyticsPeriodDto;
  granularity: "hour" | "day";
  currency: string;
  points: SalesSeriesPointDto[];
}

export interface TopCheckoutDto {
  checkoutId: string;
  internalTitle: string;
  displayName: string;
  revenueInCents: number;
  ordersCount: number;
}

export interface TopCheckoutsDto {
  period: AnalyticsPeriodDto;
  currency: string;
  items: TopCheckoutDto[];
}
