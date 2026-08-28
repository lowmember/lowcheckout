import axios from "axios";

import type { ApiError } from "@/shared/api/types";

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}
