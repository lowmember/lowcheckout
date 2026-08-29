import { Account } from "@/domain/accounts/entities/account.entity";
import { toAccountRevenueRange } from "@/domain/accounts/value-objects/account-revenue-range";
import { toAccountStatus } from "@/domain/accounts/value-objects/account-status";
import type { AccountRow, NewAccountRow } from "@/infra/persistence/drizzle/schema";

export function toAccount(row: AccountRow): Account {
  return Account.restore({
    id: row.id,
    businessName: row.businessName,
    document: row.document,
    documentType: row.documentType,
    phone: row.phone,
    contactEmail: row.contactEmail,
    sellsWhat: row.sellsWhat,
    estimatedRevenue:
      row.estimatedRevenue === null ? null : toAccountRevenueRange(row.estimatedRevenue),
    status: toAccountStatus(row.status),
    onboardingCompletedAt: row.onboardingCompletedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export function toAccountRow(account: Account): NewAccountRow {
  const snapshot = account.toSnapshot();

  return {
    id: snapshot.id,
    businessName: snapshot.businessName,
    document: snapshot.document,
    documentType: snapshot.documentType,
    phone: snapshot.phone,
    contactEmail: snapshot.contactEmail,
    sellsWhat: snapshot.sellsWhat,
    estimatedRevenue: snapshot.estimatedRevenue,
    status: snapshot.status,
    onboardingCompletedAt: snapshot.onboardingCompletedAt,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
    deletedAt: snapshot.deletedAt,
  };
}
