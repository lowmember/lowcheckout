import type { Clock } from "@/application/shared/ports/clock";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { Logger } from "@/application/shared/ports/logger";
import { Notification } from "@/domain/notifications/entities/notification.entity";
import type { NotificationsRepository } from "@/domain/notifications/repositories/notifications.repository";
import type { NotificationType } from "@/domain/notifications/value-objects/notification-type";
import type { Order } from "@/domain/orders/entities/order.entity";

/**
 * Traduz o ciclo de vida do pedido em avisos do painel (RF-NOT-01).
 *
 * Toda escrita é best-effort: uma notificação que não gravou não pode derrubar
 * a confirmação de um pagamento nem a expiração de um PIX.
 */
export interface SalesNotifier {
  notify(order: Order, type: NotificationType): Promise<void>;
}

const CENTS_IN_UNIT = 100;

export class DefaultSalesNotifier implements SalesNotifier {
  private readonly notificationsRepository: NotificationsRepository;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;
  private readonly logger: Logger;

  constructor(
    notificationsRepository: NotificationsRepository,
    idGenerator: IdGenerator,
    clock: Clock,
    logger: Logger,
  ) {
    this.notificationsRepository = notificationsRepository;
    this.idGenerator = idGenerator;
    this.clock = clock;
    this.logger = logger;
  }

  async notify(order: Order, type: NotificationType): Promise<void> {
    const snapshot = order.toSnapshot();
    const amount = DefaultSalesNotifier.formatAmount(snapshot.amountInCents, snapshot.currency);

    try {
      await this.notificationsRepository.create(
        Notification.create({
          id: this.idGenerator.generate(),
          accountId: order.ownerAccountId,
          type,
          title: DefaultSalesNotifier.buildTitle(type, amount),
          body: `${snapshot.productNameSnapshot} · ${snapshot.offerNameSnapshot} — ${snapshot.buyerName}`,
          orderId: order.orderId,
          checkoutId: order.sourceCheckoutId,
          now: this.clock.now(),
        }),
      );
    } catch (error) {
      this.logger.error("notification_write_failed", {
        type,
        orderId: order.orderId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private static buildTitle(type: NotificationType, amount: string): string {
    if (type === "sale_paid") return `Venda aprovada de ${amount}`;
    if (type === "sale_expired") return `PIX de ${amount} expirou`;

    return `Novo PIX gerado de ${amount}`;
  }

  private static formatAmount(amountInCents: number, currency: string): string {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(
      amountInCents / CENTS_IN_UNIT,
    );
  }
}
