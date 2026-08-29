export const PAYMENT_STATUSES = ["pending", "paid", "expired", "failed", "refunded"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
