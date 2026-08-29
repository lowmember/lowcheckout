import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

export const CHECKOUT_STATUSES = ["draft", "active", "paused", "archived"] as const;

export type CheckoutStatus = (typeof CHECKOUT_STATUSES)[number];

export function isCheckoutStatus(value: string): value is CheckoutStatus {
  return (CHECKOUT_STATUSES as readonly string[]).includes(value);
}

export function toCheckoutStatus(value: string): CheckoutStatus {
  if (!isCheckoutStatus(value)) {
    throw new InvariantViolationError(`"${value}" is not a valid checkout status`);
  }

  return value;
}
