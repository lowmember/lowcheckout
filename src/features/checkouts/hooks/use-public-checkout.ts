import { useQuery } from "@tanstack/react-query";

import { publicCheckoutQueries } from "@/features/checkouts/api/public-checkout.queries";
import { toCustomization } from "@/features/checkouts/lib/checkout-schema";
import type { CheckoutContent } from "@/features/checkouts/types/checkout-content";

/**
 * Carrega a página pública e resolve **a configuração publicada** — nunca o
 * rascunho. Editar sem publicar não altera o que o comprador vê.
 */
export function usePublicCheckout(publicSlug: string) {
  const { data, isLoading, isError, error } = useQuery(publicCheckoutQueries.detail(publicSlug));

  const customization = data ? toCustomization(data.customization) : undefined;

  const content: CheckoutContent | undefined = data && {
    displayName: data.displayName,
    productName: data.product.name,
    productDescription: data.product.description,
    productImageUrl: data.product.imageUrl,
    offerName: data.offer.name,
    priceInCents: data.offer.priceInCents,
    currency: data.offer.currency,
    bannerDesktopUrl: data.bannerDesktopUrl,
    bannerMobileUrl: data.bannerMobileUrl,
  };

  return {
    publicCheckout: data,
    publishedSchema: customization?.published ?? null,
    content,
    isLoadingPublicCheckout: isLoading,
    hasPublicCheckoutError: isError,
    publicCheckoutError: error,
  };
}
