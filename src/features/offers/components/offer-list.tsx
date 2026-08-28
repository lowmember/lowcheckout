import { useState } from "react";

import { OfferFormDialog } from "@/features/offers/components/offer-form-dialog";
import { useProductOffers } from "@/features/offers/hooks/use-product-offers";
import type { Offer } from "@/features/offers/types/offer";
import { formatCurrency } from "@/shared/lib/format-currency";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { LinkIcon, PencilIcon, PlusIcon, TicketIcon } from "@/shared/ui/icons";
import { Skeleton } from "@/shared/ui/skeleton";

interface OfferListProps {
  productId: string;
  productDefaultDeliveryUrl: string | null;
}

export function OfferList({ productId, productDefaultDeliveryUrl }: OfferListProps) {
  const { offers, isLoadingOffers, hasOffersError } = useProductOffers(productId);
  const [editingOffer, setEditingOffer] = useState<Offer>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function openCreate() {
    setEditingOffer(undefined);
    setIsDialogOpen(true);
  }

  function openEdit(offer: Offer) {
    setEditingOffer(offer);
    setIsDialogOpen(true);
  }

  return (
    <Card>
      <CardHeader
        title="Ofertas"
        description="Cada oferta é uma variação comercial do produto. O preço mora aqui."
        action={
          <Button size="sm" variant="secondary" onClick={openCreate}>
            <PlusIcon className="size-4" />
            Nova oferta
          </Button>
        }
      />

      {isLoadingOffers && (
        <div className="space-y-3 px-5 pb-5">
          {[0, 1].map((index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      )}

      {hasOffersError && (
        <p className="px-5 pb-5 text-red-600 text-sm">
          Não foi possível carregar as ofertas deste produto.
        </p>
      )}

      {!isLoadingOffers && !hasOffersError && offers.length === 0 && (
        <div className="px-5 pb-5">
          <EmptyState
            icon={<TicketIcon className="size-5" />}
            title="Nenhuma oferta ainda"
            description="Sem oferta, este produto não tem preço nem página pública."
            action={
              <Button size="sm" onClick={openCreate}>
                <PlusIcon className="size-4" />
                Criar primeira oferta
              </Button>
            }
          />
        </div>
      )}

      {offers.length > 0 && (
        <ul className="border-neutral-200 border-t">
          {offers.map((offer) => {
            const inheritsDelivery = offer.deliveryUrl === null;

            return (
              <li
                key={offer.id}
                className="flex items-start justify-between gap-4 border-neutral-100 border-b px-5 py-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-neutral-900 text-sm">{offer.name}</p>
                    {offer.status === "archived" && <Badge tone="neutral">Arquivada</Badge>}
                  </div>

                  <p className="mt-1 font-semibold text-lg text-neutral-900 leading-none tracking-tight">
                    {formatCurrency(offer.priceInCents, offer.currency)}
                  </p>

                  <p className="mt-2 flex items-start gap-1.5 text-neutral-500 text-xs leading-relaxed">
                    <LinkIcon className="mt-px size-3.5 shrink-0" />
                    <span className="min-w-0 break-all">
                      {inheritsDelivery ? (
                        <>
                          <span className="font-medium text-neutral-600">
                            Herda o entregável do produto:
                          </span>{" "}
                          {offer.resolvedDeliveryUrl ?? productDefaultDeliveryUrl ?? "não definido"}
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-neutral-600">Entregável próprio:</span>{" "}
                          {offer.deliveryUrl}
                        </>
                      )}
                    </span>
                  </p>
                </div>

                <Button variant="ghost" size="sm" onClick={() => openEdit(offer)}>
                  <PencilIcon className="size-4" />
                  Editar
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <OfferFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        productId={productId}
        productDefaultDeliveryUrl={productDefaultDeliveryUrl}
        offer={editingOffer}
      />
    </Card>
  );
}
