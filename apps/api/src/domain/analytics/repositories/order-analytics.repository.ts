import type {
  AnalyticsGranularity,
  AnalyticsPeriod,
} from "@/domain/analytics/value-objects/analytics-period";

export interface AnalyticsQuery {
  accountId: string;
  period: AnalyticsPeriod;
}

/**
 * Contagens da home (RF-ANL-02/03). O pedido entra no período pela **data de
 * aprovação** quando está pago (S19); pendente e expirado não têm aprovação, e
 * por isso entram pela data de criação.
 */
export interface OrdersOverview {
  revenueInCents: number;
  /**
   * Soma dos pedidos ainda `awaiting_payment` do período — dinheiro que pode
   * entrar, não faturamento. Fica separado de `revenueInCents` de propósito:
   * RF-ANL-02 é explícito em não somar pendente ao faturamento.
   */
  pendingRevenueInCents: number;
  paidCount: number;
  pendingCount: number;
  expiredCount: number;
}

export interface SalesSeriesPoint {
  /** Início do balde, em horário de São Paulo (`YYYY-MM-DDTHH:mm:ss`). */
  bucket: string;
  revenueInCents: number;
  ordersCount: number;
}

export interface CheckoutRevenueRankingItem {
  checkoutId: string;
  internalTitle: string;
  displayName: string;
  revenueInCents: number;
  ordersCount: number;
}

/**
 * Porta de leitura do analytics. É um read model: agrega `orders` direto, sem
 * reidratar entidade nenhuma — carregar mil pedidos para somá-los em memória
 * seria desperdício, e o rollup `checkout_daily_metrics` é a saída Pós-MVP.
 */
export interface OrderAnalyticsRepository {
  overview(query: AnalyticsQuery): Promise<OrdersOverview>;
  salesSeries(
    query: AnalyticsQuery,
    granularity: AnalyticsGranularity,
  ): Promise<SalesSeriesPoint[]>;
  topCheckouts(query: AnalyticsQuery, limit: number): Promise<CheckoutRevenueRankingItem[]>;
}
