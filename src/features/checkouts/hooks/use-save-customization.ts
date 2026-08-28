import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveCheckoutCustomization, updateCheckout } from "@/features/checkouts/api/checkouts.api";
import { checkoutKeys } from "@/features/checkouts/api/checkouts.queries";
import type { CheckoutSchema } from "@/features/checkouts/types/checkout-schema";
import {
  CHECKOUT_CUSTOMIZATION_VERSION,
  type CheckoutCustomization,
  type CustomizationSource,
} from "@/features/checkouts/types/customization";
import { getApiErrorMessage } from "@/shared/api/get-error-message";

interface SaveInput {
  customization: CheckoutCustomization;
  source: CustomizationSource;
}

/**
 * Escrita da configuração. "Salvar" grava só o rascunho; "Publicar" copia o
 * rascunho para `published` e ativa o checkout — duas escritas do mesmo
 * documento, sem inventar um sistema de versões (RF-CHK-07/09).
 */
export function useSaveCustomization(checkoutId: string) {
  const queryClient = useQueryClient();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: checkoutKeys.detail(checkoutId) });
    queryClient.invalidateQueries({ queryKey: checkoutKeys.lists() });
  }

  const save = useMutation({
    mutationFn: (input: SaveInput) => saveCheckoutCustomization(checkoutId, input),
    onSuccess: invalidate,
  });

  const publish = useMutation({
    mutationFn: async (input: SaveInput) => {
      await saveCheckoutCustomization(checkoutId, input);
      // Publicar é o que torna o checkout acessível: só aqui ele sai de rascunho.
      return updateCheckout(checkoutId, { status: "active" });
    },
    onSuccess: invalidate,
  });

  function saveDraft(
    customization: CheckoutCustomization,
    draft: CheckoutSchema,
    source: CustomizationSource,
  ) {
    return save.mutateAsync({
      customization: { ...customization, version: CHECKOUT_CUSTOMIZATION_VERSION, draft },
      source,
    });
  }

  /** Publicar reescreve o documento inteiro: o rascunho vira a versão pública. */
  function publishDraft(draft: CheckoutSchema) {
    return publish.mutateAsync({
      customization: {
        version: CHECKOUT_CUSTOMIZATION_VERSION,
        draft,
        published: draft,
        publishedAt: new Date().toISOString(),
      },
      source: "builder",
    });
  }

  return {
    saveDraft,
    publishDraft,
    isSavingDraft: save.isPending,
    isPublishing: publish.isPending,
    didSaveDraft: save.isSuccess,
    didPublish: publish.isSuccess,
    saveErrorMessage:
      save.isError || publish.isError
        ? getApiErrorMessage(
            save.error ?? publish.error,
            "Não foi possível salvar a configuração do checkout.",
          )
        : null,
  };
}
