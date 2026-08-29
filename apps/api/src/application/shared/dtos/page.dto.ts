/** Envelope de listagem devolvido pelos casos de uso — só primitivos. */
export interface PageDto<TItem> {
  data: TItem[];
  meta: {
    page: number;
    perPage: number;
    total: number;
  };
}
