import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

export const PRODUCT_STATUSES = ["active", "archived"] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export function isProductStatus(value: string): value is ProductStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(value);
}

export function toProductStatus(value: string): ProductStatus {
  if (!isProductStatus(value)) {
    throw new InvariantViolationError(`"${value}" não é um status de produto válido`);
  }

  return value;
}
