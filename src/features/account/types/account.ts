export type AccountDocumentType = "cpf" | "cnpj";

/** `accounts.sells_what` — lista fechada (RF-ONB-02). */
export type SellsWhat =
  | "infoproduct"
  | "physical"
  | "service"
  | "mentoring"
  | "subscription"
  | "other";

/** `account_revenue_range` no modelo de dados da API. */
export type EstimatedRevenue = "up_to_10k" | "from_10k_to_50k" | "from_50k_to_100k" | "above_100k";

export type AccountStatus = "pending_onboarding" | "active" | "disabled" | "deleted";

export interface Account {
  id: string;
  businessName: string | null;
  /** Nulo enquanto o onboarding não foi concluído (RF-ONB-01). */
  document: string | null;
  documentType: AccountDocumentType | null;
  phone: string | null;
  contactEmail: string | null;
  sellsWhat: SellsWhat | null;
  estimatedRevenue: EstimatedRevenue | null;
  status: AccountStatus;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

/** Resposta de `GET /me`. */
export interface Me {
  user: AccountUser;
  account: Account;
  /** Atalho da API para o guard de rota decidir o redirecionamento (RF-ONB-01). */
  onboardingPending: boolean;
}

/** `PATCH /accounts/me/onboarding` (RF-ONB-02). */
export interface CompleteOnboardingInput {
  businessName: string;
  documentType: AccountDocumentType;
  document: string;
  phone: string;
  sellsWhat: SellsWhat;
  estimatedRevenue: EstimatedRevenue;
}

/** `PATCH /accounts/me` (RF-CONF-01). Documento nunca entra aqui (RF-CONF-02). */
export interface UpdateAccountInput {
  businessName?: string;
  contactEmail?: string;
  phone?: string;
  userName?: string;
}
