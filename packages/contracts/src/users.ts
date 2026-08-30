export interface User {
  id: string;
  /** Vem do Google e é imutável: o e-mail editável é `Account.contactEmail`. */
  email: string;
  name: string;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}
