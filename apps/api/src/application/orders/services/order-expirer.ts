import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { Logger } from "@/application/shared/ports/logger";
import { CheckoutEvent } from "@/domain/analytics/entities/checkout-event.entity";
import type { CheckoutEventsRepository } from "@/domain/analytics/repositories/checkout-events.repository";
import type { Order } from "@/domain/orders/entities/order.entity";
import { OrderEvent } from "@/domain/orders/entities/order-event.entity";
import type { OrderEventsRepository } from "@/domain/orders/repositories/order-events.repository";
import type { OrdersRepository } from "@/domain/orders/repositories/orders.repository";
import type { PaymentsRepository } from "@/domain/payments/repositories/payments.repository";

/**
 * A expiração de RF-PAG-03 em um lugar só: o job agendado e a tela do comprador
 * (que expira preguiçosamente ao consultar o status) usam este mesmo caminho,
 * para que os dois produzam exatamente os mesmos eventos.
 */
export interface OrderExpirer {
  /** `false` quando o pedido não estava expirável — já pago, por exemplo. */
  expireIfDue(order: Order, now: Date): Promise<boolean>;
}

export class DefaultOrderExpirer implements OrderExpirer {
  private readonly ordersRepository: OrdersRepository;
  private readonly orderEventsRepository: OrderEventsRepository;
  private readonly paymentsRepository: PaymentsRepository;
  private readonly checkoutEventsRepository: CheckoutEventsRepository;
  private readonly idGenerator: IdGenerator;
  private readonly logger: Logger;

  constructor(
    ordersRepository: OrdersRepository,
    orderEventsRepository: OrderEventsRepository,
    paymentsRepository: PaymentsRepository,
    checkoutEventsRepository: CheckoutEventsRepository,
    idGenerator: IdGenerator,
    logger: Logger,
  ) {
    this.ordersRepository = ordersRepository;
    this.orderEventsRepository = orderEventsRepository;
    this.paymentsRepository = paymentsRepository;
    this.checkoutEventsRepository = checkoutEventsRepository;
    this.idGenerator = idGenerator;
    this.logger = logger;
  }

  async expireIfDue(order: Order, now: Date): Promise<boolean> {
    if (!order.isExpirable(now)) {
      return false;
    }

    const transition = order.markAsExpired(now);

    if (!transition) {
      return false;
    }

    await this.ordersRepository.update(order);

    const payment = await this.paymentsRepository.findLatestByOrder(order.orderId);

    if (payment?.markAsExpired(now)) {
      await this.paymentsRepository.update(payment);
    }

    await this.orderEventsRepository.create(
      OrderEvent.create({
        id: this.idGenerator.generate(),
        accountId: order.ownerAccountId,
        orderId: order.orderId,
        fromStatus: transition.from,
        toStatus: transition.to,
        reason: "Prazo do PIX encerrado sem confirmação de pagamento",
        now,
      }),
    );

    await this.registerCheckoutEvent(order, now);

    return true;
  }

  private async registerCheckoutEvent(order: Order, now: Date): Promise<void> {
    try {
      await this.checkoutEventsRepository.create(
        CheckoutEvent.create({
          id: this.idGenerator.generate(),
          accountId: order.ownerAccountId,
          checkoutId: order.sourceCheckoutId,
          checkoutOfferId: order.sourceCheckoutOfferId,
          orderId: order.orderId,
          type: "pix_expired",
          // Não há browser nesta transição: o funil registra o pedido como visitante.
          visitorId: order.orderId,
          now,
        }),
      );
    } catch (error) {
      this.logger.error("checkout_event_write_failed", {
        type: "pix_expired",
        orderId: order.orderId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
