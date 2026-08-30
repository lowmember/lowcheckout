import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { OfferList } from "@/features/offers";
import { ProductFormDialog, productQueries, useProduct } from "@/features/products";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { ArrowLeftIcon, ImageIcon, LinkIcon, PencilIcon } from "@/shared/ui/icons";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

export const Route = createFileRoute("/_app/produtos/$productId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(productQueries.detail(params.productId)).catch(() => null),
  component: ProductDetailsPage,
});

function ProductDetailsPage() {
  const { productId } = Route.useParams();
  const { product, isLoadingProduct, hasProductError } = useProduct(productId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoadingProduct) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (hasProductError || !product) {
    return (
      <div className="space-y-4">
        <Link to="/produtos" className="inline-flex items-center gap-1.5 text-neutral-500 text-sm">
          <ArrowLeftIcon className="size-4" />
          Voltar para produtos
        </Link>
        <Card className="px-5 py-6">
          <p className="text-red-600 text-sm">Não foi possível carregar este produto.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/produtos"
        className="inline-flex items-center gap-1.5 text-neutral-500 text-sm transition-colors hover:text-neutral-900"
      >
        <ArrowLeftIcon className="size-4" />
        Produtos
      </Link>

      <PageHeader
        title={product.name}
        description={product.description ?? "Sem descrição."}
        action={
          <div className="flex items-center gap-2">
            {product.status === "archived" && <Badge tone="neutral">Arquivado</Badge>}
            <Button variant="secondary" size="sm" onClick={() => setIsDialogOpen(true)}>
              <PencilIcon className="size-4" />
              Editar
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <OfferList
          productId={product.id}
          productDefaultDeliveryUrl={product.defaultDeliveryUrl}
          productImageUrl={product.imageUrl}
        />

        <Card className="self-start">
          <CardHeader title="Detalhes" />
          <CardBody className="space-y-4">
            <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-400">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt="" className="size-full object-cover" />
              ) : (
                <span className="flex items-center gap-1.5 text-xs">
                  <ImageIcon className="size-4" />
                  Sem imagem
                </span>
              )}
            </div>

            <div>
              <p className="font-medium text-neutral-700 text-xs">Entregável padrão</p>
              <p className="mt-1 flex items-start gap-1.5 break-all text-neutral-500 text-xs leading-relaxed">
                <LinkIcon className="mt-px size-3.5 shrink-0" />
                {product.defaultDeliveryUrl ?? "Não definido — cada oferta precisa do seu próprio."}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <ProductFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        product={product}
      />
    </div>
  );
}
