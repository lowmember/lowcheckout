import type { OrderExpirer } from "@/application/orders/services/order-expirer";
import type { PublicOrderDto } from "@/application/public/dtos/public-order.dto";
import { toPublicOrderDto } from "@/application/public/mappers/public-order.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { UseCase } from "@/application/shared/use-case";
import { OrderNotFoundError } from "@/domain/orders/errors/order-not-found.error";
import type { OrdersRepository } from "@/domain/orders/repositories/orders.repository";
import type { PaymentsRepository } from "@/domain/payments/repositories/payments.repository";

export interface GetPublicOrderInput {
  orderId: string;
}

export type GetPublicOrderUseCase = UseCase<GetPublicOrderInput, PublicOrderDto>;

/**
 * Tela do PIX e tela de obrigado (RF-PUB-04/06). Não exige sessão: o id do
 * pedido é a credencial, como o `public_slug`. O entregável só é devolvido para
 * pedido pago — o mapper cuida disso.
 */
export class DefaultGetPublicOrderUseCase implements GetPublicOrderUseCase {
  private readonly ordersRepository: OrdersRepository;
  private readonly paymentsRepository: PaymentsRepository;
  private readonly orderExpirer: OrderExpirer;
  private readonly clock: Clock;

  constructor(
    ordersRepository: OrdersRepository,
    paymentsRepository: PaymentsRepository,
    orderExpirer: OrderExpirer,
    clock: Clock,
  ) {
    this.ordersRepository = ordersRepository;
    this.paymentsRepository = paymentsRepository;
    this.orderExpirer = orderExpirer;
    this.clock = clock;
  }

  async execute({ orderId }: GetPublicOrderInput): Promise<PublicOrderDto> {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    // Expira na leitura para a tela não mostrar "aguardando" depois do prazo,
    // mesmo que o job agendado ainda não tenha passado (RF-PAG-03).
    await this.orderExpirer.expireIfDue(order, this.clock.now());

    const payment = await this.paymentsRepository.findLatestByOrder(orderId);

    return toPublicOrderDto(order, payment);
  }
}
