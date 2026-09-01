import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { ProductDeleteDialog } from "@/features/products/components/product-delete-dialog";
import { useProducts } from "@/features/products/hooks/use-products";
import type { ListProductsParams, ProductListItem } from "@/features/products/types/product";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ChevronRightIcon, ImageIcon, PackageIcon, TrashIcon } from "@/shared/ui/icons";
import { Skeleton } from "@/shared/ui/skeleton";

interface ProductListProps {
  params?: ListProductsParams;
  emptyAction?: React.ReactNode;
}

export function ProductList({ params, emptyAction }: ProductListProps) {
  const { products, isLoadingProducts, hasProductsError } = useProducts(params);
  const [productToDelete, setProductToDelete] = useState<ProductListItem | null>(null);

  if (isLoadingProducts) {
    return (
      <Card className="divide-y divide-neutral-200">
        {[0, 1, 2].map((index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="size-11 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </Card>
    );
  }

  if (hasProductsError) {
    return (
      <Card className="px-5 py-6">
        <p className="text-red-600 text-sm">Não foi possível carregar seus produtos.</p>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageIcon className="size-5" />}
        title="Nenhum produto ainda"
        description="Produtos guardam o que você vende. As variações de preço ficam nas ofertas."
        action={emptyAction}
      />
    );
  }

  return (
    <>
      <Card className="divide-y divide-neutral-200 overflow-hidden">
        {products.map((product) => (
          // O link cobre a linha inteira (`absolute inset-0`) para o botão de
          // deletar não virar um <button> dentro de <a>.
          <div
            key={product.id}
            className="group relative flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
          >
            <Link
              to="/produtos/$productId"
              params={{ productId: product.id }}
              aria-label={`Abrir ${product.name}`}
              className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-inset"
            />

            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-400">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <ImageIcon className="size-4.5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-neutral-900 text-sm">{product.name}</p>
              <p className="mt-0.5 truncate text-neutral-500 text-xs">
                {product.offersCount === 1 ? "1 oferta" : `${product.offersCount ?? 0} ofertas`}
                {product.description ? ` · ${product.description}` : ""}
              </p>
            </div>

            {product.status === "archived" && <Badge tone="neutral">Arquivado</Badge>}

            <Button
              variant="ghost"
              size="sm"
              aria-label={`Deletar ${product.name}`}
              className="relative px-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
              onClick={() => setProductToDelete(product)}
            >
              <TrashIcon className="size-4" />
            </Button>

            <ChevronRightIcon
              className={cn(
                "size-4 shrink-0 text-neutral-300",
                "transition-[color,translate] duration-200 ease-out",
                "group-hover:translate-x-0.5 group-hover:text-neutral-500",
              )}
            />
          </div>
        ))}
      </Card>

      {productToDelete && (
        <ProductDeleteDialog
          isOpen
          product={productToDelete}
          onClose={() => setProductToDelete(null)}
          onDeleted={() => setProductToDelete(null)}
        />
      )}
    </>
  );
}
