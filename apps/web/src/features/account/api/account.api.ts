import type {
  Account,
  CompleteOnboardingInput,
  Me,
  UpdateAccountInput,
} from "@/features/account/types/account";
import { httpClient } from "@/shared/api/http-client";
import type { ApiResponse } from "@/shared/api/types";

export async function getMe() {
  const response = await httpClient.get<ApiResponse<Me>>("/me");
  return response.data.data;
}

/** Conclui o onboarding bloqueante da conta (RF-ONB-01/02). */
export async function completeOnboarding(input: CompleteOnboardingInput) {
  const response = await httpClient.patch<ApiResponse<Account>>("/accounts/me/onboarding", input);
  return response.data.data;
}

export async function updateAccount(input: UpdateAccountInput) {
  const response = await httpClient.patch<ApiResponse<Account>>("/accounts/me", input);
  return response.data.data;
}
