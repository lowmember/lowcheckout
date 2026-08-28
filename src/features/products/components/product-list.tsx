import { Link } from "@tanstack/react-router";

import { useProducts } from "@/features/products/hooks/use-products";
import type { ListProductsParams } from "@/features/products/types/product";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ChevronRightIcon, ImageIcon, PackageIcon } from "@/shared/ui/icons";
import { Skeleton } from "@/shared/ui/skeleton";

interface ProductListProps {
  params?: ListProductsParams;
  emptyAction?: React.ReactNode;
}

export function ProductList({ params, emptyAction }: ProductListProps) {
  const { products, isLoadingProducts, hasProductsError } = useProducts(params);

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
    <Card className="divide-y divide-neutral-200 overflow-hidden">
      {products.map((product) => (
        <Link
          key={product.id}
          to="/produtos/$productId"
          params={{ productId: product.id }}
          className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
        >
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

          <ChevronRightIcon
            className={cn(
              "size-4 shrink-0 text-neutral-300",
              "transition-[color,translate] duration-200 ease-out",
              "group-hover:translate-x-0.5 group-hover:text-neutral-500",
            )}
          />
        </Link>
      ))}
    </Card>
  );
}
