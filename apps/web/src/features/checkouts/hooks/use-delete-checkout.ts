import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteCheckout } from "@/features/checkouts/api/checkouts.api";
import { checkoutKeys } from "@/features/checkouts/api/checkouts.queries";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

interface UseDeleteCheckoutOptions {
  checkoutId: string;
  onSuccess?: () => void;
}

/** Deleção definitiva do checkout (RF-CHK-04). */
export function useDeleteCheckout({ checkoutId, onSuccess }: UseDeleteCheckoutOptions) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: () => deleteCheckout(checkoutId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: checkoutKeys.detail(checkoutId) });
      queryClient.invalidateQueries({ queryKey: checkoutKeys.lists() });
      onSuccess?.();
    },
  });

  return {
    removeCheckout: mutateAsync,
    isRemovingCheckout: isPending,
    hasRemoveCheckoutError: isError,
    removeCheckoutErrorMessage: getApiErrorMessage(error, "Não foi possível deletar o checkout."),
  };
}
