import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { CheckoutStatusBadge } from "@/features/checkouts/components/checkout-status-badge";
import { useCheckouts } from "@/features/checkouts/hooks/use-checkouts";
import type { ListCheckoutsParams } from "@/features/checkouts/types/checkout";
import { useProducts } from "@/features/products";
import { cn } from "@/shared/lib/cn";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { CartIcon, ChevronRightIcon } from "@/shared/ui/icons";
import { Skeleton } from "@/shared/ui/skeleton";

interface CheckoutListProps {
  params?: ListCheckoutsParams;
  emptyAction?: ReactNode;
}

export function CheckoutList({ params, emptyAction }: CheckoutListProps) {
  const { checkouts, isLoadingCheckouts, hasCheckoutsError } = useCheckouts(params);

  // A API devolve só `productId`; o nome sai da lista de produtos, que a tela já
  // carrega. Produto fora da primeira página cai no rótulo genérico.
  const { products } = useProducts();
  const productNameById = new Map(products.map((product) => [product.id, product.name]));

  if (isLoadingCheckouts) {
    return (
      <Card className="divide-y divide-neutral-200">
        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-2 px-5 py-4">
            <Skeleton className="h-3.5 w-56" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </Card>
    );
  }

  if (hasCheckoutsError) {
    return (
      <Card className="px-5 py-6">
        <p className="text-red-600 text-sm">Não foi possível carregar seus checkouts.</p>
      </Card>
    );
  }

  if (checkouts.length === 0) {
    return (
      <EmptyState
        icon={<CartIcon className="size-5" />}
        title="Nenhum checkout ainda"
        description="Um checkout é a página de venda de um produto. As ofertas vinculadas geram as URLs públicas."
        action={emptyAction}
      />
    );
  }

  return (
    <Card className="divide-y divide-neutral-200 overflow-hidden">
      {checkouts.map((checkout) => (
        <Link
          key={checkout.id}
          to="/checkouts/$checkoutId"
          params={{ checkoutId: checkout.id }}
          className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-neutral-900 text-sm">
              {checkout.internalTitle}
            </p>
            <p className="mt-0.5 truncate text-neutral-500 text-xs">
              {productNameById.get(checkout.productId) ?? "Produto vinculado"} · exibido como “
              {checkout.displayName}”
            </p>
          </div>

          <CheckoutStatusBadge status={checkout.status} />

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
