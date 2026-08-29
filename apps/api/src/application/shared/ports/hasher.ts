/**
 * Hash determinístico e sem segredo, para guardar valores opacos que precisam
 * ser consultados por igualdade (o refresh token). Não é hash de senha: não
 * existe senha no produto.
 */
export interface Hasher {
  hash(value: string): string;
}
