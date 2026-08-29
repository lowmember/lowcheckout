import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { saveCheckoutPixels } from "@/features/checkouts/api/checkouts.api";
import { checkoutKeys, checkoutQueries } from "@/features/checkouts/api/checkouts.queries";
import type { CheckoutPixelInput } from "@/features/checkouts/types/checkout";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

/** Tracking por checkout (RF-CHK-10). */
export function useCheckoutPixels(checkoutId: string) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery(checkoutQueries.pixels(checkoutId));

  const save = useMutation({
    mutationFn: (pixels: CheckoutPixelInput[]) => saveCheckoutPixels(checkoutId, pixels),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkoutKeys.pixels(checkoutId) });
    },
  });

  return {
    pixels: data ?? [],
    isLoadingPixels: isLoading,
    hasPixelsError: isError,
    savePixels: save.mutateAsync,
    isSavingPixels: save.isPending,
    didSavePixels: save.isSuccess,
    savePixelsErrorMessage: save.isError
      ? getApiErrorMessage(save.error, "Não foi possível salvar os pixels.")
      : null,
  };
}
