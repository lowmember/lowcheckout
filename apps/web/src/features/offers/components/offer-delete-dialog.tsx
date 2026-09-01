import { useDeleteOffer } from "@/features/offers/hooks/use-delete-offer";
import type { Offer } from "@/features/offers/types/offer";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

interface OfferDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  offer: Offer;
}

export function OfferDeleteDialog({ isOpen, onClose, productId, offer }: OfferDeleteDialogProps) {
  const { removeOffer, isRemovingOffer, hasRemoveOfferError, removeOfferErrorMessage } =
    useDeleteOffer({ productId, offerId: offer.id, onSuccess: onClose });

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Deletar esta oferta?"
      description="Ela some do produto imediatamente."
      confirmLabel="Deletar"
      isDestructive
      isConfirming={isRemovingOffer}
      onConfirm={() => void removeOffer().catch(() => undefined)}
      onCancel={onClose}
    >
      <div className="space-y-3">
        <p className="text-neutral-600 text-sm leading-relaxed">
          “{offer.name}” deixa de existir junto com seu preço e entregável. Ofertas vinculadas a um
          checkout ou com pedidos no histórico não podem ser deletadas — desvincule ou arquive.
        </p>
        {hasRemoveOfferError && (
          <p role="alert" className="animate-fade-in text-red-600 text-sm">
            {removeOfferErrorMessage}
          </p>
        )}
      </div>
    </ConfirmDialog>
  );
}
