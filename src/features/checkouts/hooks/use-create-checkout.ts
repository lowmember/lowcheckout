import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCheckout } from "@/features/checkouts/api/checkouts.api";
import { checkoutKeys } from "@/features/checkouts/api/checkouts.queries";
import type { CreateCheckoutInput } from "@/features/checkouts/types/checkout";

export function useCreateCheckout() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: CreateCheckoutInput) => createCheckout(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkoutKeys.lists() });
    },
  });

  return {
    createCheckout: mutateAsync,
    isCreatingCheckout: isPending,
  };
}
