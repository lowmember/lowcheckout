import type { SalesNotifier } from "@/application/notifications/services/sales-notifier";
import type { Clock } from "@/application/shared/ports/clock";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { Logger } from "@/application/shared/ports/logger";
import type { Mailer } from "@/application/shared/ports/mailer";
import { CheckoutEvent } from "@/domain/analytics/entities/checkout-event.entity";
import type { CheckoutEventsRepository } from "@/domain/analytics/repositories/checkout-events.repository";
import type { Order } from "@/domain/orders/entities/order.entity";
import { OrderEvent } from "@/domain/orders/entities/order-event.entity";
import type { OrderEventsRepository } from "@/domain/orders/repositories/order-events.repository";
import type { OrdersRepository } from "@/domain/orders/repositories/orders.repository";

/**
 * A confirmação de pagamento (RF-PAG-04) e a entrega (RF-PAG-05) num caminho só.
 * Idempotente por construção: o pedido já pago devolve `false` e nada — nem
 * evento, nem e-mail — é repetido numa reentrega do webhook (RF-GTW-02).
 */
export interface OrderPaymentConfirmer {
  confirm(order: Order, paidAt: Date, reason: string): Promise<boolean>;
}

export class DefaultOrderPaymentConfirmer implements OrderPaymentConfirmer {
  private readonly ordersRepository: OrdersRepository;
  private readonly orderEventsRepository: OrderEventsRepository;
  private readonly checkoutEventsRepository: CheckoutEventsRepository;
  private readonly mailer: Mailer;
  private readonly salesNotifier: SalesNotifier;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;
  private readonly logger: Logger;

  constructor(
    ordersRepository: OrdersRepository,
    orderEventsRepository: OrderEventsRepository,
    checkoutEventsRepository: CheckoutEventsRepository,
    mailer: Mailer,
    salesNotifier: SalesNotifier,
    idGenerator: IdGenerator,
    clock: Clock,
    logger: Logger,
  ) {
    this.ordersRepository = ordersRepository;
    this.orderEventsRepository = orderEventsRepository;
    this.checkoutEventsRepository = checkoutEventsRepository;
    this.mailer = mailer;
    this.salesNotifier = salesNotifier;
    this.idGenerator = idGenerator;
    this.clock = clock;
    this.logger = logger;
  }

  async confirm(order: Order, paidAt: Date, reason: string): Promise<boolean> {
    const now = this.clock.now();
    const transition = order.markAsPaid(paidAt, now);

    if (!transition) {
      return false;
    }

    await this.ordersRepository.update(order);

    await this.orderEventsRepository.create(
      OrderEvent.create({
        id: this.idGenerator.generate(),
        accountId: order.ownerAccountId,
        orderId: order.orderId,
        fromStatus: transition.from,
        toStatus: transition.to,
        // `expired → paid` é o caso que mais interessa registrar (S14).
        reason,
        metadata: { lateConfirmation: transition.from === "expired" },
        now,
      }),
    );

    await this.registerCheckoutEvent(order, now);
    await this.salesNotifier.notify(order, "sale_paid");
    await this.deliver(order, now);

    return true;
  }

  /**
   * RF-PAG-05: exatamente um e-mail por pedido aprovado. Falha de envio **não**
   * desfaz o pagamento — o pedido segue pago e a tela de obrigado continua
   * mostrando o acesso.
   */
  private async deliver(order: Order, now: Date): Promise<void> {
    if (!order.markDeliverySent(now)) {
      return;
    }

    try {
      await this.mailer.send({
        to: order.buyerEmailAddress,
        subject: `Seu acesso a ${order.toSnapshot().productNameSnapshot}`,
        textBody: [
          `Olá, ${order.toSnapshot().buyerName}!`,
          "",
          "Seu pagamento foi confirmado. Este é o seu acesso:",
          order.deliveryUrl,
          "",
          "Se precisar, é só responder este e-mail.",
        ].join("\n"),
      });

      await this.ordersRepository.update(order);
    } catch (error) {
      this.logger.error("delivery_email_failed", {
        orderId: order.orderId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
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
          type: "payment_paid",
          visitorId: order.orderId,
          now,
        }),
      );
    } catch (error) {
      this.logger.error("checkout_event_write_failed", {
        type: "payment_paid",
        orderId: order.orderId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
