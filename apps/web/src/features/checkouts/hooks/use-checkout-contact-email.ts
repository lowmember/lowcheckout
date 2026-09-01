import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  confirmCheckoutContactEmail,
  requestCheckoutContactEmailVerification,
} from "@/features/checkouts/api/checkouts.api";
import { checkoutKeys } from "@/features/checkouts/api/checkouts.queries";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

interface UseCheckoutContactEmailOptions {
  checkoutId: string;
}

/** Os dois passos de RF-CHK-11: pedir o código e confirmá-lo. */
export function useCheckoutContactEmail({ checkoutId }: UseCheckoutContactEmailOptions) {
  const queryClient = useQueryClient();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: checkoutKeys.detail(checkoutId) });
  }

  const request = useMutation({
    mutationFn: (contactEmail: string) =>
      requestCheckoutContactEmailVerification(checkoutId, contactEmail),
    onSuccess: invalidate,
  });

  const confirm = useMutation({
    mutationFn: (code: string) => confirmCheckoutContactEmail(checkoutId, code),
    onSuccess: invalidate,
  });

  return {
    requestCode: request.mutateAsync,
    isRequestingCode: request.isPending,
    didRequestCode: request.isSuccess,
    requestCodeErrorMessage: request.isError
      ? getApiErrorMessage(request.error, "Não foi possível enviar o código.")
      : null,
    confirmCode: confirm.mutateAsync,
    isConfirmingCode: confirm.isPending,
    confirmCodeErrorMessage: confirm.isError
      ? getApiErrorMessage(confirm.error, "Não foi possível confirmar o código.")
      : null,
    resetConfirmCode: confirm.reset,
  };
}
