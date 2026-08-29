import { PaymentWebhookEvent } from "@/domain/payments/entities/payment-webhook-event.entity";
import { Payment } from "@/domain/payments/entities/payment.entity";
import type {
  NewPaymentRow,
  NewPaymentWebhookEventRow,
  PaymentRow,
} from "@/infra/persistence/drizzle/schema";

export function toPayment(row: PaymentRow): Payment {
  return Payment.restore({
    id: row.id,
    accountId: row.accountId,
    orderId: row.orderId,
    provider: row.provider,
    method: row.method,
    status: row.status,
    externalChargeId: row.externalChargeId,
    amountInCents: row.amountInCents,
    qrCodeImageUrl: row.qrCodeImageUrl,
    qrCodePayload: row.qrCodePayload,
    expiresAt: row.expiresAt,
    paidAt: row.paidAt,
    rawPayload: row.rawPayload,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function toPaymentRow(payment: Payment): NewPaymentRow {
  const snapshot = payment.toSnapshot();

  return {
    id: snapshot.id,
    accountId: snapshot.accountId,
    orderId: snapshot.orderId,
    provider: snapshot.provider,
    method: snapshot.method,
    status: snapshot.status,
    externalChargeId: snapshot.externalChargeId,
    amountInCents: snapshot.amountInCents,
    qrCodeImageUrl: snapshot.qrCodeImageUrl,
    qrCodePayload: snapshot.qrCodePayload,
    expiresAt: snapshot.expiresAt,
    paidAt: snapshot.paidAt,
    rawPayload: snapshot.rawPayload,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}

export function toPaymentWebhookEventRow(
  event: PaymentWebhookEvent,
): NewPaymentWebhookEventRow {
  const snapshot = event.toSnapshot();

  return {
    id: snapshot.id,
    provider: snapshot.provider,
    externalEventId: snapshot.externalEventId,
    paymentId: snapshot.paymentId,
    payload: snapshot.payload,
    status: snapshot.status,
    error: snapshot.error,
    receivedAt: snapshot.receivedAt,
    processedAt: snapshot.processedAt,
  };
}
