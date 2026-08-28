import type { Account, SignupInput } from "@/features/signup/types/signup";
import { httpClient } from "@/shared/api/http-client";
import type { ApiResponse } from "@/shared/api/types";

export async function createAccount(input: SignupInput) {
  const response = await httpClient.post<ApiResponse<Account>>("/accounts", input);
  return response.data.data;
}
