import { useDeleteProduct } from "@/features/products/hooks/use-delete-product";
import type { Product } from "@/features/products/types/product";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

interface ProductDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onDeleted: () => void;
}

export function ProductDeleteDialog({
  isOpen,
  onClose,
  product,
  onDeleted,
}: ProductDeleteDialogProps) {
  const { removeProduct, isRemovingProduct, hasRemoveProductError, removeProductErrorMessage } =
    useDeleteProduct({ productId: product.id, onSuccess: onDeleted });

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Deletar este produto?"
      description="Ele some do painel imediatamente."
      confirmLabel="Deletar"
      isDestructive
      isConfirming={isRemovingProduct}
      onConfirm={() => void removeProduct().catch(() => undefined)}
      onCancel={onClose}
    >
      <div className="space-y-3">
        <p className="text-neutral-600 text-sm leading-relaxed">
          “{product.name}” deixa de existir junto com sua imagem e o entregável padrão. Produtos com
          ofertas ou checkouts ligados não podem ser deletados — desfaça esses vínculos antes.
        </p>
        {hasRemoveProductError && (
          <p role="alert" className="animate-fade-in text-red-600 text-sm">
            {removeProductErrorMessage}
          </p>
        )}
      </div>
    </ConfirmDialog>
  );
}
