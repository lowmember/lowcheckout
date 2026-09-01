import { type CheckoutContent, toCustomization } from "@lowcheckout/checkout-renderer";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { publicCheckoutQueries } from "@/features/checkout/api/public-checkout.queries";
import { persistVisitorId, readVisitorId } from "@/features/checkout/lib/browser-storage";
import { loadPixels } from "@/features/checkout/lib/pixels";

/**
 * Carrega a página pública de um slug e resolve **a configuração publicada**.
 *
 * Nunca o rascunho: editar sem publicar não pode mudar o que o comprador vê
 * (RF-CHK-07). Quando não há nada publicado, `publishedSchema` sai `null` e a
 * página assume esse estado em vez de cair no rascunho.
 */
export function usePublicCheckout(publicSlug: string) {
  const { data, isLoading, isError } = useQuery(
    publicCheckoutQueries.detail(publicSlug, readVisitorId()),
  );

  // A API devolve o visitante da primeira visita; guardamos para que os eventos
  // seguintes deste comprador caiam na mesma sessão do funil (RF-PUB-08).
  useEffect(() => {
    if (data?.visitorId) {
      persistVisitorId(data.visitorId);
    }
  }, [data?.visitorId]);

  useEffect(() => {
    if (data) {
      loadPixels(data.pixels);
    }
  }, [data]);

  const publishedSchema = useMemo(
    () => (data ? toCustomization(data.customization).published : null),
    [data],
  );

  const content: CheckoutContent | null = data
    ? {
        displayName: data.displayName,
        productName: data.product.name,
        productDescription: data.product.description,
        productImageUrl: data.product.imageUrl,
        // O nome da oferta é interno ao lojista; o contrato público não o expõe.
        offerName: null,
        priceInCents: data.offer.priceInCents,
        currency: data.offer.currency,
        bannerDesktopUrl: data.bannerDesktopUrl,
        bannerMobileUrl: data.bannerMobileUrl,
        contactEmail: data.contactEmail,
      }
    : null;

  return {
    publishedSchema,
    content,
    paymentAvailable: data?.paymentAvailable ?? false,
    isLoadingCheckout: isLoading,
    hasCheckoutError: isError,
  };
}
