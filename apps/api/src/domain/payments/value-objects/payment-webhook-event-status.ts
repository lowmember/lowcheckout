export const PAYMENT_WEBHOOK_EVENT_STATUSES = ["received", "processed", "failed"] as const;

export type PaymentWebhookEventStatus = (typeof PAYMENT_WEBHOOK_EVENT_STATUSES)[number];
