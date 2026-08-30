/**
 * Reexporta o contrato: a forma deste DTO é a mesma que `apps/web` consome, e
 * existe uma definição só, em `@lowcheckout/contracts`. O sufixo `Dto` é a
 * convenção de papel da API (CLAUDE.md) e por isso o alias fica aqui.
 */

export type {
  AnalyticsOverview as AnalyticsOverviewDto,
  AnalyticsPeriodInfo as AnalyticsPeriodDto,
  SalesSeries as SalesSeriesDto,
  SalesSeriesPoint as SalesSeriesPointDto,
  TopCheckout as TopCheckoutDto,
  TopCheckouts as TopCheckoutsDto,
} from "@lowcheckout/contracts";
