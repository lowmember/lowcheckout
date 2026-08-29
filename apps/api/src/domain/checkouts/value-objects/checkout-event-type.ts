export const CHECKOUT_EVENT_TYPES = [
  "page_view",
  "checkout_started",
  "pix_generated",
  "payment_paid",
  "pix_expired",
] as const;

export type CheckoutEventType = (typeof CHECKOUT_EVENT_TYPES)[number];
