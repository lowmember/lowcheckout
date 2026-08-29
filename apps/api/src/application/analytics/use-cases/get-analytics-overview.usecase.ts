import type { AnalyticsOverviewDto } from "@/application/analytics/dtos/analytics.dto";
import type { Clock } from "@/application/shared/ports/clock";
import type { UseCase } from "@/application/shared/use-case";
import type { OrderAnalyticsRepository } from "@/domain/analytics/repositories/order-analytics.repository";
import {
  ANALYTICS_TIME_ZONE,
  AnalyticsPeriod,
} from "@/domain/analytics/value-objects/analytics-period";

/** Moeda única do produto (RNF): não há conversão nem multi-moeda no MVP. */
const CURRENCY = "BRL";

export interface GetAnalyticsOverviewInput {
  accountId: string;
  from?: Date | null;
  to?: Date | null;
}

export type GetAnalyticsOverviewUseCase = UseCase<GetAnalyticsOverviewInput, AnalyticsOverviewDto>;

/** RF-ANL-02 + RF-ANL-03: faturamento, ticket médio e os três cards, no mesmo período. */
export class DefaultGetAnalyticsOverviewUseCase implements GetAnalyticsOverviewUseCase {
  private readonly orderAnalyticsRepository: OrderAnalyticsRepository;
  private readonly clock: Clock;

  constructor(orderAnalyticsRepository: OrderAnalyticsRepository, clock: Clock) {
    this.orderAnalyticsRepository = orderAnalyticsRepository;
    this.clock = clock;
  }

  async execute(input: GetAnalyticsOverviewInput): Promise<AnalyticsOverviewDto> {
    const period = AnalyticsPeriod.create({
      from: input.from,
      to: input.to,
      now: this.clock.now(),
    });

    const overview = await this.orderAnalyticsRepository.overview({
      accountId: input.accountId,
      period,
    });

    return {
      period: {
        from: period.startsAt.toISOString(),
        to: period.endsAt.toISOString(),
        timeZone: ANALYTICS_TIME_ZONE,
      },
      revenueInCents: overview.revenueInCents,
      pendingRevenueInCents: overview.pendingRevenueInCents,
      // Período sem venda mostra zero, não divisão por zero (RF-ANL-02).
      averageTicketInCents:
        overview.paidCount === 0 ? 0 : Math.round(overview.revenueInCents / overview.paidCount),
      currency: CURRENCY,
      sales: {
        approved: overview.paidCount,
        pending: overview.pendingCount,
        expired: overview.expiredCount,
      },
    };
  }
}
