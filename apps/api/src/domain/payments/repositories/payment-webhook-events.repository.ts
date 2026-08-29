import type { PaymentWebhookEvent } from "@/domain/payments/entities/payment-webhook-event.entity";

export interface PaymentWebhookEventsRepository {
  /**
   * `false` quando o `unique(provider, external_event_id)` recusa o insert — ou
   * seja, o gateway reentregou um evento já recebido. É esse retorno que
   * sustenta a idempotência (RF-GTW-02).
   */
  createIfNew(event: PaymentWebhookEvent): Promise<boolean>;
  update(event: PaymentWebhookEvent): Promise<void>;
}
