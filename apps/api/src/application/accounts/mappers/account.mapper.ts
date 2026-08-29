import type { AccountDto } from "@/application/accounts/dtos/account.dto";
import type { Account } from "@/domain/accounts/entities/account.entity";

export function toAccountDto(account: Account): AccountDto {
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
    onboardingCompletedAt: snapshot.onboardingCompletedAt?.toISOString() ?? null,
    createdAt: snapshot.createdAt.toISOString(),
    updatedAt: snapshot.updatedAt.toISOString(),
  };
}
