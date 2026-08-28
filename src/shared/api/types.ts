export interface ApiResponse<TData> {
  data: TData;
  message?: string;
}

export interface PaginatedResponse<TData> {
  data: TData[];
  meta: {
    page: number;
    perPage: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
}
