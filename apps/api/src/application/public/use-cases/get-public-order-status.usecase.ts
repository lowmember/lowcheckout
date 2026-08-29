import type { OrderExpirer } from "@/application/orders/services/order-expirer";
import type { PublicOrderStatusDto } from "@/application/public/dtos/public-order.dto";
import { toPublicOrderStatusDto } from "@/application/public/mappers/public-order.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { UseCase } from "@/application/shared/use-case";
import { OrderNotFoundError } from "@/domain/orders/errors/order-not-found.error";
import type { OrdersRepository } from "@/domain/orders/repositories/orders.repository";

export interface GetPublicOrderStatusInput {
  orderId: string;
}

export type GetPublicOrderStatusUseCase = UseCase<GetPublicOrderStatusInput, PublicOrderStatusDto>;

/**
 * RF-PUB-05: é o que a tela do PIX consulta para avançar sozinha. Resposta
 * enxuta de propósito — é chamada em intervalo curto enquanto o PIX vive.
 */
export class DefaultGetPublicOrderStatusUseCase implements GetPublicOrderStatusUseCase {
  private readonly ordersRepository: OrdersRepository;
  private readonly orderExpirer: OrderExpirer;
  private readonly clock: Clock;

  constructor(ordersRepository: OrdersRepository, orderExpirer: OrderExpirer, clock: Clock) {
    this.ordersRepository = ordersRepository;
    this.orderExpirer = orderExpirer;
    this.clock = clock;
  }

  async execute({ orderId }: GetPublicOrderStatusInput): Promise<PublicOrderStatusDto> {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    await this.orderExpirer.expireIfDue(order, this.clock.now());

    return toPublicOrderStatusDto(order);
  }
}
