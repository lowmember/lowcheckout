import { useEffect, useState } from "react";

import { useDeleteCheckout } from "@/features/checkouts/hooks/use-delete-checkout";
import type { Checkout } from "@/features/checkouts/types/checkout";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { CONTROL_CLASSNAME } from "@/shared/ui/field";

const DELETE_CONFIRMATION = "DELETAR";

interface CheckoutDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  checkout: Checkout;
  onDeleted: () => void;
}

export function CheckoutDeleteDialog({
  isOpen,
  onClose,
  checkout,
  onDeleted,
}: CheckoutDeleteDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const { removeCheckout, isRemovingCheckout, hasRemoveCheckoutError, removeCheckoutErrorMessage } =
    useDeleteCheckout({ checkoutId: checkout.id, onSuccess: onDeleted });

  useEffect(() => {
    if (isOpen) setConfirmationText("");
  }, [isOpen]);

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Deletar este checkout definitivamente?"
      description="Esta ação não pode ser desfeita pela interface."
      confirmLabel="Deletar para sempre"
      isDestructive
      isConfirming={isRemovingCheckout}
      isConfirmDisabled={confirmationText !== DELETE_CONFIRMATION}
      onConfirm={() => void removeCheckout().catch(() => undefined)}
      onCancel={onClose}
    >
      <div className="space-y-3">
        <p className="text-neutral-600 text-sm leading-relaxed">
          As URLs públicas das ofertas vinculadas a “{checkout.internalTitle}” param de responder e
          o design salvo deixa de existir. Para confirmar, digite{" "}
          <strong className="text-neutral-900">{DELETE_CONFIRMATION}</strong> abaixo.
        </p>
        <input
          value={confirmationText}
          onChange={(event) => setConfirmationText(event.target.value)}
          placeholder={DELETE_CONFIRMATION}
          aria-label={`Digite ${DELETE_CONFIRMATION} para confirmar`}
          className={CONTROL_CLASSNAME}
        />
        {confirmationText !== DELETE_CONFIRMATION && (
          <p className="text-neutral-500 text-xs">
            O botão de confirmação só age depois que o texto conferir.
          </p>
        )}
        {hasRemoveCheckoutError && (
          <p role="alert" className="animate-fade-in text-red-600 text-sm">
            {removeCheckoutErrorMessage}
          </p>
        )}
      </div>
    </ConfirmDialog>
  );
}
