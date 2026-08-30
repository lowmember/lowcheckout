import { useMemo, useState } from "react";

import { OfferFormDialog } from "@/features/offers/components/offer-form-dialog";
import { useProductOffers } from "@/features/offers/hooks/use-product-offers";
import type { Offer } from "@/features/offers/types/offer";
import { cn } from "@/shared/lib/cn";
import { formatCurrency } from "@/shared/lib/format-currency";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { AlertTriangleIcon, LinkIcon, PencilIcon, PlusIcon, TicketIcon } from "@/shared/ui/icons";
import { Skeleton } from "@/shared/ui/skeleton";

interface OfferListProps {
  productId: string;
  productDefaultDeliveryUrl: string | null;
  productImageUrl?: string | null;
}

export function OfferList({
  productId,
  productDefaultDeliveryUrl,
  productImageUrl,
}: OfferListProps) {
  const { offers, isLoadingOffers, hasOffersError } = useProductOffers(productId);
  const [editingOffer, setEditingOffer] = useState<Offer>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /** Arquivadas descem para o fim: a lista abre pelo que ainda vende. */
  const sortedOffers = useMemo(
    () =>
      [...offers].sort((a, b) => Number(a.status === "archived") - Number(b.status === "archived")),
    [offers],
  );

  const activeCount = offers.filter((offer) => offer.status === "active").length;

  function openCreate() {
    setEditingOffer(undefined);
    setIsDialogOpen(true);
  }

  function openEdit(offer: Offer) {
    setEditingOffer(offer);
    setIsDialogOpen(true);
  }

  return (
    <Card className="self-start overflow-hidden">
      <CardHeader
        title="Ofertas"
        description="Cada oferta é uma variação comercial do produto. O preço mora aqui."
        action={
          <div className="flex shrink-0 items-center gap-2">
            {offers.length > 0 && (
              <Badge tone={activeCount > 0 ? "success" : "neutral"}>
                {activeCount === 1 ? "1 ativa" : `${activeCount} ativas`}
              </Badge>
            )}
            <Button size="sm" variant="secondary" onClick={openCreate}>
              <PlusIcon className="size-4" />
              Nova oferta
            </Button>
          </div>
        }
      />

      {isLoadingOffers && (
        <div className="divide-y divide-neutral-100 border-neutral-200 border-t">
          {[0, 1].map((index) => (
            <div key={index} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="size-11 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-4 w-20 shrink-0" />
            </div>
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

      {sortedOffers.length > 0 && (
        <ul className="divide-y divide-neutral-100 border-neutral-200 border-t">
          {sortedOffers.map((offer) => (
            <OfferRow
              key={offer.id}
              offer={offer}
              productDefaultDeliveryUrl={productDefaultDeliveryUrl}
              productImageUrl={productImageUrl}
              onEdit={() => openEdit(offer)}
            />
          ))}
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

interface OfferRowProps {
  offer: Offer;
  productDefaultDeliveryUrl: string | null;
  productImageUrl?: string | null;
  onEdit: () => void;
}

function OfferRow({ offer, productDefaultDeliveryUrl, productImageUrl, onEdit }: OfferRowProps) {
  const isArchived = offer.status === "archived";
  const inheritsDelivery = offer.deliveryUrl === null;
  const deliveryUrl = inheritsDelivery
    ? (offer.resolvedDeliveryUrl ?? productDefaultDeliveryUrl)
    : offer.deliveryUrl;
  const imageUrl = offer.imageUrl ?? productImageUrl ?? null;

  return (
    <li>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar oferta ${offer.name}`}
        className={cn(
          "group flex w-full items-center gap-4 px-5 py-3.5 text-left",
          "transition-colors duration-200 ease-out hover:bg-neutral-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-inset",
        )}
      >
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg",
            "border border-neutral-200 bg-neutral-50 text-neutral-400",
            isArchived && "opacity-60 grayscale",
          )}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="" className="size-full object-cover" loading="lazy" />
          ) : (
            <TicketIcon className="size-4.5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "truncate font-medium text-sm",
                isArchived ? "text-neutral-500" : "text-neutral-900",
              )}
            >
              {offer.name}
            </p>
            {isArchived && <Badge tone="neutral">Arquivada</Badge>}
          </div>

          <p
            className="mt-1 flex items-center gap-1.5 text-neutral-500 text-xs"
            title={deliveryUrl ?? undefined}
          >
            {deliveryUrl ? (
              <>
                <LinkIcon className="size-3.5 shrink-0" />
                <span className="truncate">{deliveryUrl}</span>
                <span className="shrink-0 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-px font-medium text-[11px] text-neutral-500">
                  {inheritsDelivery ? "Herdado do produto" : "Próprio"}
                </span>
              </>
            ) : (
              <>
                <AlertTriangleIcon className="size-3.5 shrink-0 text-amber-500" />
                <span className="truncate text-amber-700">
                  Sem entregável — defina uma URL nesta oferta ou no produto.
                </span>
              </>
            )}
          </p>
        </div>

        <p
          className={cn(
            "shrink-0 font-semibold text-sm tabular-nums",
            isArchived ? "text-neutral-400" : "text-neutral-900",
          )}
        >
          {formatCurrency(offer.priceInCents, offer.currency)}
        </p>

        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md text-neutral-300",
            "transition-[color,background-color] duration-200 ease-out",
            "group-hover:bg-neutral-100 group-hover:text-neutral-700",
            "group-focus-visible:bg-neutral-100 group-focus-visible:text-neutral-700",
          )}
        >
          <PencilIcon className="size-4" />
        </span>
      </button>
    </li>
  );
}
