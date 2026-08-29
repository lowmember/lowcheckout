import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createCheckout,
  linkOfferToCheckout,
  saveCheckoutCustomization,
} from "@/features/checkouts/api/checkouts.api";
import { checkoutKeys } from "@/features/checkouts/api/checkouts.queries";
import { createTemplateSchema } from "@/features/checkouts/lib/templates";
import type { CheckoutTemplateId } from "@/features/checkouts/types/checkout-schema";
import { CHECKOUT_CUSTOMIZATION_VERSION } from "@/features/checkouts/types/customization";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

export interface CreateFromTemplateInput {
  templateId: CheckoutTemplateId;
  productId: string;
  offerId: string;
  internalTitle: string;
  displayName: string;
}

/**
 * Criação guiada: cria o checkout, vincula a oferta escolhida e grava o schema
 * do template como rascunho — nessa ordem, para o editor abrir já com conteúdo
 * e URL pública prontos.
 */
export function useCreateCheckoutFromTemplate() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: async (input: CreateFromTemplateInput) => {
      const checkout = await createCheckout({
        productId: input.productId,
        internalTitle: input.internalTitle,
        displayName: input.displayName,
      });

      await linkOfferToCheckout(checkout.id, input.offerId);

      await saveCheckoutCustomization(checkout.id, {
        customization: {
          version: CHECKOUT_CUSTOMIZATION_VERSION,
          draft: createTemplateSchema(input.templateId),
          published: null,
          publishedAt: null,
        },
        source: "builder",
      });

      return checkout;
    },
    onSuccess: (checkout) => {
      queryClient.invalidateQueries({ queryKey: checkoutKeys.lists() });
      queryClient.invalidateQueries({ queryKey: checkoutKeys.detail(checkout.id) });
    },
  });

  return {
    createCheckoutFromTemplate: mutateAsync,
    isCreatingCheckout: isPending,
    hasCreateCheckoutError: isError,
    createCheckoutErrorMessage: getApiErrorMessage(error, "Não foi possível criar o checkout."),
  };
}
