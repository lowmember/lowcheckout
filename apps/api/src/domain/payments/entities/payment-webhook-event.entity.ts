import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";
import type { PaymentWebhookEventStatus } from "@/domain/payments/value-objects/payment-webhook-event-status";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface PaymentWebhookEventSnapshot {
  id: string;
  provider: GatewayProvider;
  externalEventId: string;
  paymentId: string | null;
  payload: Record<string, unknown>;
  status: PaymentWebhookEventStatus;
  error: string | null;
  receivedAt: Date;
  processedAt: Date | null;
}

export interface CreatePaymentWebhookEventProps {
  id: string;
  provider: GatewayProvider;
  externalEventId: string;
  payload: Record<string, unknown>;
  now: Date;
}

const MAX_ERROR_LENGTH = 500;

/**
 * O registro que torna o webhook idempotente (RF-GTW-02): gravar **primeiro**,
 * colidir no `unique(provider, external_event_id)` e descartar a reentrega antes
 * de tocar o pedido.
 */
export class PaymentWebhookEvent {
  private readonly id: string;
  private readonly provider: GatewayProvider;
  private readonly externalEventId: string;
  private paymentId: string | null;
  private readonly payload: Record<string, unknown>;
  private status: PaymentWebhookEventStatus;
  private error: string | null;
  private readonly receivedAt: Date;
  private processedAt: Date | null;

  private constructor(snapshot: PaymentWebhookEventSnapshot) {
    this.id = snapshot.id;
    this.provider = snapshot.provider;
    this.externalEventId = snapshot.externalEventId;
    this.paymentId = snapshot.paymentId;
    this.payload = snapshot.payload;
    this.status = snapshot.status;
    this.error = snapshot.error;
    this.receivedAt = snapshot.receivedAt;
    this.processedAt = snapshot.processedAt;
  }

  static create(props: CreatePaymentWebhookEventProps): PaymentWebhookEvent {
    return new PaymentWebhookEvent({
      id: props.id,
      provider: props.provider,
      externalEventId: props.externalEventId,
      paymentId: null,
      payload: props.payload,
      status: "received",
      error: null,
      receivedAt: props.now,
      processedAt: null,
    });
  }

  static restore(snapshot: PaymentWebhookEventSnapshot): PaymentWebhookEvent {
    return new PaymentWebhookEvent(snapshot);
  }

  get webhookEventId(): string {
    return this.id;
  }

  markAsProcessed(paymentId: string | null, now: Date): void {
    this.paymentId = paymentId;
    this.status = "processed";
    this.error = null;
    this.processedAt = now;
  }

  markAsFailed(error: string, now: Date): void {
    this.status = "failed";
    this.error = error.slice(0, MAX_ERROR_LENGTH);
    this.processedAt = now;
  }

  toSnapshot(): PaymentWebhookEventSnapshot {
    return {
      id: this.id,
      provider: this.provider,
      externalEventId: this.externalEventId,
      paymentId: this.paymentId,
      payload: this.payload,
      status: this.status,
      error: this.error,
      receivedAt: this.receivedAt,
      processedAt: this.processedAt,
    };
  }
}
