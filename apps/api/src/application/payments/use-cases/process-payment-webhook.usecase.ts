import type { OrderPaymentConfirmer } from "@/application/orders/services/order-payment-confirmer";
import type { WebhookResultDto } from "@/application/payments/dtos/webhook-result.dto";
import type {
  WebhookPayloadReader,
  WebhookPaymentNotification,
} from "@/application/payments/ports/webhook-payload-reader";
import type { Clock } from "@/application/shared/ports/clock";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { Logger } from "@/application/shared/ports/logger";
import type { UseCase } from "@/application/shared/use-case";
import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";
import type { OrdersRepository } from "@/domain/orders/repositories/orders.repository";
import { PaymentWebhookEvent } from "@/domain/payments/entities/payment-webhook-event.entity";
import type { PaymentWebhookEventsRepository } from "@/domain/payments/repositories/payment-webhook-events.repository";
import type { PaymentsRepository } from "@/domain/payments/repositories/payments.repository";

export interface ProcessPaymentWebhookInput {
  provider: GatewayProvider;
  payload: Record<string, unknown>;
}

export type ProcessPaymentWebhookUseCase = UseCase<ProcessPaymentWebhookInput, WebhookResultDto>;

/**
 * RF-GTW-02 + RF-PAG-04. A idempotência é estrutural, não uma verificação
 * "consultar antes de gravar": o evento é gravado **primeiro** e a colisão no
 * `unique(provider, external_event_id)` é o que descarta a reentrega — antes de
 * qualquer coisa tocar o pedido.
 */
export class DefaultProcessPaymentWebhookUseCase implements ProcessPaymentWebhookUseCase {
  private readonly webhookEventsRepository: PaymentWebhookEventsRepository;
  private readonly paymentsRepository: PaymentsRepository;
  private readonly ordersRepository: OrdersRepository;
  private readonly orderPaymentConfirmer: OrderPaymentConfirmer;
  private readonly payloadReaders: readonly WebhookPayloadReader[];
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;
  private readonly logger: Logger;

  constructor(
    webhookEventsRepository: PaymentWebhookEventsRepository,
    paymentsRepository: PaymentsRepository,
    ordersRepository: OrdersRepository,
    orderPaymentConfirmer: OrderPaymentConfirmer,
    payloadReaders: readonly WebhookPayloadReader[],
    idGenerator: IdGenerator,
    clock: Clock,
    logger: Logger,
  ) {
    this.webhookEventsRepository = webhookEventsRepository;
    this.paymentsRepository = paymentsRepository;
    this.ordersRepository = ordersRepository;
    this.orderPaymentConfirmer = orderPaymentConfirmer;
    this.payloadReaders = payloadReaders;
    this.idGenerator = idGenerator;
    this.clock = clock;
    this.logger = logger;
  }

  async execute({ provider, payload }: ProcessPaymentWebhookInput): Promise<WebhookResultDto> {
    const notification = this.readNotification(provider, payload);

    if (!notification) {
      // Corpo irreconhecível: nada a fazer, mas responder erro faria o gateway
      // reentregar para sempre.
      this.logger.info("webhook_ignored", { provider });

      return { received: true, outcome: "ignored" };
    }

    const now = this.clock.now();
    const event = PaymentWebhookEvent.create({
      id: this.idGenerator.generate(),
      provider,
      externalEventId: notification.externalEventId,
      payload,
      now,
    });

    if (!(await this.webhookEventsRepository.createIfNew(event))) {
      return { received: true, outcome: "duplicate" };
    }

    try {
      const payment = await this.paymentsRepository.findByExternalChargeId(
        provider,
        notification.externalChargeId,
      );

      if (!payment) {
        // Cobrança desconhecida: descartada sem tocar em dado nenhum (RF-PAG-04).
        event.markAsProcessed(null, now);
        await this.webhookEventsRepository.update(event);

        return { received: true, outcome: "unknown_charge" };
      }

      if (notification.paid) {
        await this.confirmPayment(payment.relatedOrderId, notification.paidAt ?? now, payment, now);
      }

      event.markAsProcessed(payment.paymentId, now);
      await this.webhookEventsRepository.update(event);

      return { received: true, outcome: "processed" };
    } catch (error) {
      // Registrar a falha permite ao gateway reentregar — e o registro do evento
      // já gravado seria um obstáculo, então ele volta a "failed" para auditoria.
      event.markAsFailed(error instanceof Error ? error.message : String(error), now);
      await this.webhookEventsRepository.update(event);

      throw error;
    }
  }

  /**
   * Pode haver mais de um leitor para o mesmo provider (o formato real e o do
   * dublê de desenvolvimento). Vale o primeiro que reconhecer o corpo.
   */
  private readNotification(
    provider: GatewayProvider,
    payload: Record<string, unknown>,
  ): WebhookPaymentNotification | null {
    for (const reader of this.payloadReaders) {
      if (reader.provider !== provider) {
        continue;
      }

      const notification = reader.read(payload);

      if (notification) {
        return notification;
      }
    }

    return null;
  }

  private async confirmPayment(
    orderId: string,
    paidAt: Date,
    payment: Awaited<ReturnType<PaymentsRepository["findByExternalChargeId"]>> & object,
    now: Date,
  ): Promise<void> {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      this.logger.error("webhook_order_missing", { orderId });

      return;
    }

    await this.orderPaymentConfirmer.confirm(order, paidAt, "Pagamento confirmado pelo gateway");

    if (payment.markAsPaid(paidAt, payment.toSnapshot().rawPayload, now)) {
      await this.paymentsRepository.update(payment);
    }
  }
}
