import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

export const ACCOUNT_STATUSES = ["pending_onboarding", "active", "disabled", "deleted"] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export function isAccountStatus(value: string): value is AccountStatus {
  return (ACCOUNT_STATUSES as readonly string[]).includes(value);
}

export function toAccountStatus(value: string): AccountStatus {
  if (!isAccountStatus(value)) {
    throw new InvariantViolationError(`"${value}" não é um status de conta válido`);
  }

  return value;
}
