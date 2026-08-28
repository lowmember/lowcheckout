export type AccountType = "cpf" | "cnpj";

export type ProductType =
  | "infoproduct"
  | "physical"
  | "service"
  | "mentoring"
  | "subscription"
  | "other";

export type RevenueRange =
  | "up_to_1k"
  | "from_1k_to_5k"
  | "from_5k_to_20k"
  | "from_20k_to_50k"
  | "from_50k_to_100k"
  | "above_100k";

export interface Account {
  id: string;
  accountType: AccountType;
  document: string;
  phone: string;
  productType: ProductType;
  revenueRange: RevenueRange;
  createdAt: string;
}

export interface SignupInput {
  accountType: AccountType;
  document: string;
  phone: string;
  productType: ProductType;
  revenueRange: RevenueRange;
}

export interface SignupFormValues {
  accountType: AccountType;
  document: string;
  phone: string;
  productType: ProductType;
  revenueRange: RevenueRange;
}

export type SignupFieldErrors = Partial<Record<keyof SignupFormValues, string>>;
