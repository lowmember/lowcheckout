/**
 * Envelopes de resposta. Todo endpoint devolve `data`; listagens acrescentam
 * `meta` com a paginação.
 */

export interface ApiResponse<TData> {
  data: TData;
  message?: string;
}

export interface PageMeta {
  page: number;
  perPage: number;
  total: number;
}

export interface PaginatedResponse<TItem> {
  data: TItem[];
  meta: PageMeta;
}

export interface ApiError {
  message: string;
  code?: string;
  /** Erros por campo, no formato que o `ZodValidator` produz. */
  details?: Record<string, string[]>;
}
