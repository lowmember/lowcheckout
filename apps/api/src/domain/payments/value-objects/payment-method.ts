export const PAYMENT_METHODS = ["pix"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
