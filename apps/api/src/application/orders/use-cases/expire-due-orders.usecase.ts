import type { OrderExpirer } from "@/application/orders/services/order-expirer";
import type { Clock } from "@/application/shared/ports/clock";
import type { Logger } from "@/application/shared/ports/logger";
import type { UseCase } from "@/application/shared/use-case";
import type { OrdersRepository } from "@/domain/orders/repositories/orders.repository";

export interface ExpireDueOrdersInput {
  /** Teto por execução: a lambda roda de novo em minutos, não precisa esvaziar a fila. */
  limit?: number;
}

export interface ExpireDueOrdersOutput {
  scanned: number;
  expired: number;
}

export type ExpireDueOrdersUseCase = UseCase<ExpireDueOrdersInput, ExpireDueOrdersOutput>;

const DEFAULT_LIMIT = 200;

/**
 * RF-PAG-03, rodando de forma agendada. A expiração é automática, sem ação do
 * usuário nem do comprador. Um pedido que falhar não impede os demais.
 */
export class DefaultExpireDueOrdersUseCase implements ExpireDueOrdersUseCase {
  private readonly ordersRepository: OrdersRepository;
  private readonly orderExpirer: OrderExpirer;
  private readonly clock: Clock;
  private readonly logger: Logger;

  constructor(
    ordersRepository: OrdersRepository,
    orderExpirer: OrderExpirer,
    clock: Clock,
    logger: Logger,
  ) {
    this.ordersRepository = ordersRepository;
    this.orderExpirer = orderExpirer;
    this.clock = clock;
    this.logger = logger;
  }

  async execute({ limit }: ExpireDueOrdersInput): Promise<ExpireDueOrdersOutput> {
    const now = this.clock.now();
    const orders = await this.ordersRepository.findExpirable(now, limit ?? DEFAULT_LIMIT);

    let expired = 0;

    for (const order of orders) {
      try {
        if (await this.orderExpirer.expireIfDue(order, now)) {
          expired += 1;
        }
      } catch (error) {
        this.logger.error("order_expiration_failed", {
          orderId: order.orderId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.logger.info("orders_expired", { scanned: orders.length, expired });

    return { scanned: orders.length, expired };
  }
}
