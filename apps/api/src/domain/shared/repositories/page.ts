/** Fatia paginada devolvida pelas portas de repositório. */
export interface Page<TItem> {
  items: TItem[];
  total: number;
}

/** Recorte comum a toda listagem: sempre escopada por conta (multi-tenancy). */
export interface AccountScopedQuery {
  accountId: string;
  page: number;
  perPage: number;
}
