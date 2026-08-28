export interface ApiResponse<TData> {
  data: TData;
  message?: string;
}

export interface PaginatedMeta {
  page: number;
  perPage: number;
  total: number;
}

export interface PaginatedResponse<TData> {
  data: TData[];
  meta: PaginatedMeta;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}
