import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

export const OFFER_STATUSES = ["active", "archived"] as const;

export type OfferStatus = (typeof OFFER_STATUSES)[number];

export function isOfferStatus(value: string): value is OfferStatus {
  return (OFFER_STATUSES as readonly string[]).includes(value);
}

export function toOfferStatus(value: string): OfferStatus {
  if (!isOfferStatus(value)) {
    throw new InvariantViolationError(`"${value}" não é um status de oferta válido`);
  }

  return value;
}
