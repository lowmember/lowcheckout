import { useMutation } from "@tanstack/react-query";

import { type Account, completeOnboarding } from "@/features/account";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

interface UseSignupOptions {
  onSuccess?: (account: Account) => void;
}

export function useSignup({ onSuccess }: UseSignupOptions = {}) {
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess,
  });

  return {
    signup: mutate,
    isSigningUp: isPending,
    hasSignupError: isError,
    signupErrorMessage: getApiErrorMessage(
      error,
      "Não foi possível concluir seu cadastro. Tente novamente.",
    ),
  };
}
