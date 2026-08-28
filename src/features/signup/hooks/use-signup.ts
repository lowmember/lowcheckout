import { useMutation } from "@tanstack/react-query";

import { createAccount } from "@/features/signup/api/signup.api";
import type { Account } from "@/features/signup/types/signup";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

interface UseSignupOptions {
  onSuccess?: (account: Account) => void;
}

export function useSignup({ onSuccess }: UseSignupOptions = {}) {
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createAccount,
    onSuccess,
  });

  return {
    signup: mutate,
    isSigningUp: isPending,
    hasSignupError: isError,
    signupErrorMessage: getApiErrorMessage(
      error,
      "Não foi possível criar sua conta. Tente novamente.",
    ),
  };
}
