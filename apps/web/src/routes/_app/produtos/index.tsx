import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ProductFormDialog, ProductList, productQueries } from "@/features/products";
import { Button } from "@/shared/ui/button";
import { PlusIcon } from "@/shared/ui/icons";
import { PageHeader } from "@/shared/ui/page-header";

export const Route = createFileRoute("/_app/produtos/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(productQueries.list()).catch(() => null),
  component: ProductsPage,
});

function ProductsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="O que você vende. As variações de preço ficam nas ofertas de cada produto."
        action={
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <PlusIcon className="size-4" />
            Novo produto
          </Button>
        }
      />

      <ProductList
        emptyAction={
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <PlusIcon className="size-4" />
            Criar primeiro produto
          </Button>
        }
      />

      <ProductFormDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  );
}
