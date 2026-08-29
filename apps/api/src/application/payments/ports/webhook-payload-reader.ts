import type { GatewayProvider } from "@/domain/gateways/value-objects/gateway-provider";

/** O que a aplicação precisa extrair de um webhook, qualquer que seja o provedor. */
export interface WebhookPaymentNotification {
  /** Chave de idempotência: `unique(provider, external_event_id)` (RF-GTW-02). */
  externalEventId: string;
  /** Correlaciona com `payments.external_charge_id` (RF-PAG-04). */
  externalChargeId: string;
  paid: boolean;
  paidAt: Date | null;
}

/**
 * Porta de leitura do payload do webhook. Cada provedor tem o seu formato; a
 * aplicação não deve conhecer nenhum deles.
 */
export interface WebhookPayloadReader {
  readonly provider: GatewayProvider;
  /** `null` quando o corpo não descreve uma notificação de pagamento reconhecível. */
  read(payload: Record<string, unknown>): WebhookPaymentNotification | null;
}
