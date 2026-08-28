import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateAccount } from "@/features/account/api/account.api";
import { accountKeys } from "@/features/account/api/account.queries";
import type { UpdateAccountInput } from "@/features/account/types/account";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess, error } = useMutation({
    mutationFn: (input: UpdateAccountInput) => updateAccount(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.me() });
    },
  });

  return {
    updateAccount: mutateAsync,
    isUpdatingAccount: isPending,
    hasUpdateAccountError: isError,
    didUpdateAccount: isSuccess,
    updateAccountErrorMessage: getApiErrorMessage(
      error,
      "Não foi possível salvar suas alterações.",
    ),
  };
}
