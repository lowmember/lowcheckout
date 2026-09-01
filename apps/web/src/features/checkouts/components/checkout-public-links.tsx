import { toCustomization } from "@lowcheckout/checkout-renderer";

import { useCheckoutOffers } from "@/features/checkouts/hooks/use-checkout-offers";
import { buildPublicCheckoutUrl } from "@/features/checkouts/lib/public-url";
import type { Checkout } from "@/features/checkouts/types/checkout";
import { Badge } from "@/shared/ui/badge";
import { CopyButton } from "@/shared/ui/copy-button";
import { AlertTriangleIcon, ExternalLinkIcon, LinkIcon } from "@/shared/ui/icons";

interface CheckoutPublicLinksProps {
  checkout: Checkout;
}

/**
 * As URLs públicas do checkout, acima das abas (RF-CHK-05).
 *
 * Fica fora das abas de propósito: "publiquei, cadê o link?" é a pergunta
 * seguinte a publicar, e não deve depender de o lojista adivinhar que a
 * resposta mora em Ofertas.
 *
 * Aparece só com configuração publicada. Antes disso a página do comprador
 * responde "ainda não foi publicado", e divulgar a URL seria queimá-la.
 */
export function CheckoutPublicLinks({ checkout }: CheckoutPublicLinksProps) {
  const { checkoutOffers, isLoadingCheckoutOffers } = useCheckoutOffers(checkout.id);
  const { published } = toCustomization(checkout.customization);

  if (published === null || isLoadingCheckoutOffers) {
    return null;
  }

  // A URL não é do checkout, é de cada vínculo checkout↔oferta. Publicar sem
  // nenhuma oferta vinculada não produz página nenhuma — e esse é justamente o
  // caso em que o lojista acha que está no ar e não está.
  if (checkoutOffers.length === 0) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangleIcon className="mt-px size-4 shrink-0 text-amber-600" />
        <p className="text-amber-900 text-sm">
          Este checkout está publicado, mas ainda não tem página pública: a URL nasce do vínculo com
          uma oferta. Vincule uma oferta na aba <strong className="font-medium">Ofertas</strong>.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Links públicos do checkout" className="space-y-2">
      <h2 className="font-medium text-neutral-500 text-xs">
        {checkoutOffers.length === 1 ? "Link público" : "Links públicos"}
      </h2>

      <ul className="space-y-2">
        {checkoutOffers.map((checkoutOffer) => {
          const publicUrl = buildPublicCheckoutUrl(checkoutOffer.publicSlug);

          return (
            <li key={checkoutOffer.id} className="flex items-center gap-2">
              <span className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-neutral-600 text-xs">
                <LinkIcon className="size-3.5 shrink-0 text-neutral-400" />
                <span className="truncate font-mono">{publicUrl}</span>

                {/* Com mais de uma URL, o nome da oferta é o que as distingue. */}
                {checkoutOffers.length > 1 && (
                  <span className="hidden min-w-0 truncate text-neutral-400 sm:inline">
                    · {checkoutOffer.offer.name}
                  </span>
                )}

                {/* URL desligada continua existindo, mas responde como indisponível. */}
                {!checkoutOffer.isActive && (
                  <span className="shrink-0">
                    <Badge tone="warning">URL desligada</Badge>
                  </span>
                )}
              </span>

              <CopyButton value={publicUrl} label="Copiar" />

              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 font-medium text-neutral-600 text-xs transition-[color,border-color] duration-200 ease-out hover:border-neutral-300 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1"
              >
                <ExternalLinkIcon className="size-3.5" />
                Abrir
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
