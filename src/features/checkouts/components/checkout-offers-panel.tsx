import { useState } from "react";

import { useCheckoutOffers } from "@/features/checkouts/hooks/use-checkout-offers";
import { buildPublicCheckoutUrl } from "@/features/checkouts/lib/public-url";
import { useProductOffers } from "@/features/offers";
import { formatCurrency } from "@/shared/lib/format-currency";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { CopyButton } from "@/shared/ui/copy-button";
import { EmptyState } from "@/shared/ui/empty-state";
import { LinkIcon, PlusIcon, TicketIcon } from "@/shared/ui/icons";
import { SelectField } from "@/shared/ui/select-field";
import { Skeleton } from "@/shared/ui/skeleton";

interface CheckoutOffersPanelProps {
  checkoutId: string;
  productId: string;
}

export function CheckoutOffersPanel({ checkoutId, productId }: CheckoutOffersPanelProps) {
  const {
    checkoutOffers,
    isLoadingCheckoutOffers,
    hasCheckoutOffersError,
    linkOffer,
    isLinkingOffer,
    unlinkOffer,
    isUnlinkingOffer,
    checkoutOffersErrorMessage,
  } = useCheckoutOffers(checkoutId);
  const { offers, isLoadingOffers } = useProductOffers(productId);

  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [offerIdToUnlink, setOfferIdToUnlink] = useState<string | null>(null);

  const linkedOfferIds = new Set(checkoutOffers.map((item) => item.offerId));
  const availableOffers = offers.filter((offer) => !linkedOfferIds.has(offer.id));

  const availableOptions =
    availableOffers.length > 0
      ? availableOffers.map((offer) => ({
          value: offer.id,
          label: `${offer.name} · ${formatCurrency(offer.priceInCents, offer.currency)}`,
        }))
      : [
          {
            value: "",
            label: isLoadingOffers ? "Carregando ofertas..." : "Nenhuma oferta disponível",
          },
        ];

  return (
    <Card>
      <CardHeader
        title="Ofertas vinculadas"
        description="Cada vínculo gera uma URL pública própria. Só ofertas deste produto podem entrar."
      />

      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <SelectField
              label="Vincular oferta"
              options={availableOptions}
              value={selectedOfferId}
              disabled={availableOffers.length === 0}
              onChange={(event) => setSelectedOfferId(event.target.value)}
            />
          </div>
          <Button
            size="sm"
            className="mb-0.5"
            isLoading={isLinkingOffer}
            disabled={!selectedOfferId && availableOffers.length === 0}
            onClick={() => {
              const offerId = selectedOfferId || availableOffers[0]?.id;
              if (!offerId) return;
              void linkOffer(offerId)
                .then(() => setSelectedOfferId(""))
                .catch(() => undefined);
            }}
          >
            <PlusIcon className="size-4" />
            Vincular
          </Button>
        </div>

        {checkoutOffersErrorMessage && (
          <p role="alert" className="animate-fade-in text-red-600 text-sm">
            {checkoutOffersErrorMessage}
          </p>
        )}

        {isLoadingCheckoutOffers && <Skeleton className="h-20 w-full" />}

        {hasCheckoutOffersError && !isLoadingCheckoutOffers && (
          <p className="text-red-600 text-sm">
            Não foi possível carregar as ofertas vinculadas a este checkout.
          </p>
        )}

        {!isLoadingCheckoutOffers && !hasCheckoutOffersError && checkoutOffers.length === 0 && (
          <EmptyState
            icon={<TicketIcon className="size-5" />}
            title="Nenhuma oferta vinculada"
            description="Sem vínculo, este checkout não tem nenhuma página pública acessível."
          />
        )}

        <ul className="space-y-2.5">
          {checkoutOffers.map((checkoutOffer) => {
            const publicUrl = buildPublicCheckoutUrl(checkoutOffer.publicSlug);
            const { offer } = checkoutOffer;

            return (
              <li
                key={checkoutOffer.id}
                className="rounded-lg border border-neutral-200 px-4 py-3.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate font-medium text-neutral-900 text-sm">{offer.name}</p>
                    <span className="text-neutral-500 text-sm">
                      {formatCurrency(offer.priceInCents, offer.currency)}
                    </span>
                    {!checkoutOffer.isActive && <Badge tone="warning">URL desligada</Badge>}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOfferIdToUnlink(checkoutOffer.offerId)}
                  >
                    Desvincular
                  </Button>
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <span className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-neutral-50 px-2.5 py-1.5 font-mono text-neutral-600 text-xs">
                    <LinkIcon className="size-3.5 shrink-0 text-neutral-400" />
                    <span className="truncate">{publicUrl}</span>
                  </span>
                  <CopyButton value={publicUrl} label="Copiar URL" />
                </div>
              </li>
            );
          })}
        </ul>
      </CardBody>

      <ConfirmDialog
        isOpen={offerIdToUnlink !== null}
        title="Desvincular esta oferta?"
        description="A URL pública dela deixa de responder imediatamente."
        confirmLabel="Desvincular"
        isDestructive
        isConfirming={isUnlinkingOffer}
        onCancel={() => setOfferIdToUnlink(null)}
        onConfirm={() => {
          if (!offerIdToUnlink) return;
          void unlinkOffer(offerIdToUnlink)
            .catch(() => undefined)
            .finally(() => setOfferIdToUnlink(null));
        }}
      >
        <p className="text-neutral-600 text-sm leading-relaxed">
          As outras URLs deste checkout não são afetadas. Revincular a oferta depois gera uma URL
          nova, não necessariamente a mesma.
        </p>
      </ConfirmDialog>
    </Card>
  );
}
