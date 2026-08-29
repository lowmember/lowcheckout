/** Contrato de saída dos casos de uso — só primitivos, nunca a entidade. */
export interface UserDto {
  id: string;
  /** Vem do Google e é imutável: o e-mail editável é `account.contactEmail` (S22). */
  email: string;
  name: string;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}
