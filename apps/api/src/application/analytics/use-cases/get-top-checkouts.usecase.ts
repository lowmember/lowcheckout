import type { TopCheckoutsDto } from "@/application/analytics/dtos/analytics.dto";
import type { Clock } from "@/application/shared/ports/clock";
import type { UseCase } from "@/application/shared/use-case";
import type { OrderAnalyticsRepository } from "@/domain/analytics/repositories/order-analytics.repository";
import {
  ANALYTICS_TIME_ZONE,
  AnalyticsPeriod,
} from "@/domain/analytics/value-objects/analytics-period";

const CURRENCY = "BRL";
const DEFAULT_LIMIT = 5;

export interface GetTopCheckoutsInput {
  accountId: string;
  from?: Date | null;
  to?: Date | null;
  limit?: number;
}

export type GetTopCheckoutsUseCase = UseCase<GetTopCheckoutsInput, TopCheckoutsDto>;

/**
 * RF-ANL-05: ranking por faturamento no período, 3 a 5 itens. Checkout excluído
 * continua contando quando teve venda no período — o ranking lê os snapshots do
 * pedido, não o estado atual do checkout.
 */
export class DefaultGetTopCheckoutsUseCase implements GetTopCheckoutsUseCase {
  private readonly orderAnalyticsRepository: OrderAnalyticsRepository;
  private readonly clock: Clock;

  constructor(orderAnalyticsRepository: OrderAnalyticsRepository, clock: Clock) {
    this.orderAnalyticsRepository = orderAnalyticsRepository;
    this.clock = clock;
  }

  async execute(input: GetTopCheckoutsInput): Promise<TopCheckoutsDto> {
    const period = AnalyticsPeriod.create({
      from: input.from,
      to: input.to,
      now: this.clock.now(),
    });

    const items = await this.orderAnalyticsRepository.topCheckouts(
      { accountId: input.accountId, period },
      input.limit ?? DEFAULT_LIMIT,
    );

    return {
      period: {
        from: period.startsAt.toISOString(),
        to: period.endsAt.toISOString(),
        timeZone: ANALYTICS_TIME_ZONE,
      },
      currency: CURRENCY,
      items,
    };
  }
}
