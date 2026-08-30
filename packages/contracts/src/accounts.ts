export const ACCOUNT_DOCUMENT_TYPES = ["cpf", "cnpj"] as const;
export type AccountDocumentType = (typeof ACCOUNT_DOCUMENT_TYPES)[number];

export const ACCOUNT_REVENUE_RANGES = [
  "up_to_10k",
  "from_10k_to_50k",
  "from_50k_to_100k",
  "above_100k",
] as const;
export type AccountRevenueRange = (typeof ACCOUNT_REVENUE_RANGES)[number];

export const ACCOUNT_STATUSES = ["pending_onboarding", "active", "disabled", "deleted"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export interface Account {
  id: string;
  businessName: string | null;
  /** Só leitura: o documento é congelado depois do onboarding (RF-CONF-02). */
  document: string | null;
  documentType: AccountDocumentType | null;
  phone: string | null;
  contactEmail: string | null;
  /**
   * Texto livre no contrato — a API aceita qualquer string de até 255
   * caracteres. A lista fechada que o cadastro mostra é escolha de UI e vive
   * no `web`, não aqui.
   */
  sellsWhat: string | null;
  estimatedRevenue: AccountRevenueRange | null;
  status: AccountStatus;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
