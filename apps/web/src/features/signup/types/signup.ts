import type { AccountDocumentType, EstimatedRevenue, SellsWhat } from "@/features/account";

export interface SignupFormValues {
  businessName: string;
  documentType: AccountDocumentType;
  document: string;
  phone: string;
  sellsWhat: SellsWhat;
  estimatedRevenue: EstimatedRevenue;
}

export type SignupFieldErrors = Partial<Record<keyof SignupFormValues, string>>;
