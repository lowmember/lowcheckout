import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCheckout } from "@/features/checkouts/api/checkouts.api";
import { checkoutKeys } from "@/features/checkouts/api/checkouts.queries";
import type { CheckoutStatus } from "@/features/checkouts/types/checkout";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

interface UsePublishCheckoutOptions {
  checkoutId: string;
}

/**
 * Publicar/despublicar é só a troca de status (RF-CHK-03) — separado de
 * `useSaveCheckout` porque o toggle do cabeçalho não envia o resto do formulário.
 */
export function usePublishCheckout({ checkoutId }: UsePublishCheckoutOptions) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: (status: CheckoutStatus) => updateCheckout(checkoutId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkoutKeys.detail(checkoutId) });
      queryClient.invalidateQueries({ queryKey: checkoutKeys.lists() });
    },
  });

  return {
    changeCheckoutStatus: mutateAsync,
    isChangingCheckoutStatus: isPending,
    hasChangeCheckoutStatusError: isError,
    changeCheckoutStatusErrorMessage: getApiErrorMessage(
      error,
      "Não foi possível alterar o status do checkout.",
    ),
  };
}
