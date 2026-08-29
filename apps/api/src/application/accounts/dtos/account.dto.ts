import type { AccountDocumentType } from "@/domain/accounts/value-objects/account-document-type";
import type { AccountRevenueRange } from "@/domain/accounts/value-objects/account-revenue-range";
import type { AccountStatus } from "@/domain/accounts/value-objects/account-status";

/** Contrato de saída dos casos de uso — só primitivos, nunca a entidade. */
export interface AccountDto {
  id: string;
  businessName: string | null;
  /** Somente leitura na API: RF-CONF-02 congela o documento após o onboarding. */
  document: string | null;
  documentType: AccountDocumentType | null;
  phone: string | null;
  contactEmail: string | null;
  sellsWhat: string | null;
  estimatedRevenue: AccountRevenueRange | null;
  status: AccountStatus;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
