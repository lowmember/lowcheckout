import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCheckout, updateCheckout } from "@/features/checkouts/api/checkouts.api";
import { checkoutKeys } from "@/features/checkouts/api/checkouts.queries";
import type { Checkout, CreateCheckoutInput } from "@/features/checkouts/types/checkout";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

interface UseSaveCheckoutOptions {
  checkoutId?: string;
  onSuccess?: (checkout: Checkout) => void;
}

/** Criação (RF-CHK-01) e edição de identidade (RF-CHK-03). */
export function useSaveCheckout({ checkoutId, onSuccess }: UseSaveCheckoutOptions = {}) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: (input: CreateCheckoutInput) =>
      checkoutId
        ? updateCheckout(checkoutId, {
            internalTitle: input.internalTitle,
            displayName: input.displayName,
            bannerDesktopUrl: input.bannerDesktopUrl,
            bannerMobileUrl: input.bannerMobileUrl,
          })
        : createCheckout(input),
    onSuccess: (checkout) => {
      queryClient.invalidateQueries({ queryKey: checkoutKeys.lists() });
      if (checkoutId) {
        queryClient.invalidateQueries({ queryKey: checkoutKeys.detail(checkoutId) });
      }
      onSuccess?.(checkout);
    },
  });

  return {
    saveCheckout: mutateAsync,
    isSavingCheckout: isPending,
    hasSaveCheckoutError: isError,
    saveCheckoutErrorMessage: getApiErrorMessage(error, "Não foi possível salvar o checkout."),
  };
}
