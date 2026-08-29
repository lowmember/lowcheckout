import type { SalesSeriesDto } from "@/application/analytics/dtos/analytics.dto";
import type { Clock } from "@/application/shared/ports/clock";
import type { UseCase } from "@/application/shared/use-case";
import type { OrderAnalyticsRepository } from "@/domain/analytics/repositories/order-analytics.repository";
import {
  ANALYTICS_TIME_ZONE,
  type AnalyticsGranularity,
  AnalyticsPeriod,
} from "@/domain/analytics/value-objects/analytics-period";

const CURRENCY = "BRL";

export interface GetSalesSeriesInput {
  accountId: string;
  from?: Date | null;
  to?: Date | null;
  granularity?: AnalyticsGranularity | null;
}

export type GetSalesSeriesUseCase = UseCase<GetSalesSeriesInput, SalesSeriesDto>;

/**
 * RF-ANL-04. A série considera apenas pedidos pagos, coerente com RF-ANL-02, e
 * vem com os baldes vazios preenchidos: o gráfico não deve inventar
 * continuidade onde não houve venda.
 */
export class DefaultGetSalesSeriesUseCase implements GetSalesSeriesUseCase {
  private readonly orderAnalyticsRepository: OrderAnalyticsRepository;
  private readonly clock: Clock;

  constructor(orderAnalyticsRepository: OrderAnalyticsRepository, clock: Clock) {
    this.orderAnalyticsRepository = orderAnalyticsRepository;
    this.clock = clock;
  }

  async execute(input: GetSalesSeriesInput): Promise<SalesSeriesDto> {
    const period = AnalyticsPeriod.create({
      from: input.from,
      to: input.to,
      now: this.clock.now(),
    });
    const granularity = period.resolveGranularity(input.granularity);

    const points = await this.orderAnalyticsRepository.salesSeries(
      { accountId: input.accountId, period },
      granularity,
    );

    return {
      period: {
        from: period.startsAt.toISOString(),
        to: period.endsAt.toISOString(),
        timeZone: ANALYTICS_TIME_ZONE,
      },
      granularity,
      currency: CURRENCY,
      points,
    };
  }
}
