import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

export const ACCOUNT_REVENUE_RANGES = [
  "up_to_10k",
  "from_10k_to_50k",
  "from_50k_to_100k",
  "above_100k",
] as const;

export type AccountRevenueRange = (typeof ACCOUNT_REVENUE_RANGES)[number];

export function isAccountRevenueRange(value: string): value is AccountRevenueRange {
  return (ACCOUNT_REVENUE_RANGES as readonly string[]).includes(value);
}

export function toAccountRevenueRange(value: string): AccountRevenueRange {
  if (!isAccountRevenueRange(value)) {
    throw new InvariantViolationError(`"${value}" não é uma faixa de faturamento válida`);
  }

  return value;
}
