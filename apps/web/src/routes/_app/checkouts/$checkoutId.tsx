import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import {
  CheckoutAnalyticsPanel,
  CheckoutDeleteDialog,
  CheckoutDesignCard,
  CheckoutFormDialog,
  CheckoutOffersPanel,
  CheckoutPixelsForm,
  CheckoutPublicLinks,
  CheckoutPublishToggle,
  checkoutQueries,
  useCheckout,
} from "@/features/checkouts";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import {
  ArrowLeftIcon,
  CodeIcon,
  PencilIcon,
  SalesIcon,
  TicketIcon,
  TrashIcon,
} from "@/shared/ui/icons";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { type TabItem, Tabs } from "@/shared/ui/tabs";

type CheckoutArea = "analytics" | "offers" | "tracking" | "design";

const TABS: TabItem<CheckoutArea>[] = [
  { value: "analytics", label: "Analytics", icon: <SalesIcon className="size-4" /> },
  { value: "offers", label: "Ofertas", icon: <TicketIcon className="size-4" /> },
  { value: "tracking", label: "Tracking", icon: <CodeIcon className="size-4" /> },
  { value: "design", label: "Design", icon: <PencilIcon className="size-4" /> },
];

export const Route = createFileRoute("/_app/checkouts/$checkoutId")({
  loader: ({ context, params }) =>
    context.queryClient
      .ensureQueryData(checkoutQueries.detail(params.checkoutId))
      .catch(() => null),
  component: CheckoutDetailsPage,
});

function CheckoutDetailsPage() {
  const { checkoutId } = Route.useParams();
  const { checkout, isLoadingCheckout, hasCheckoutError } = useCheckout(checkoutId);
  const [area, setArea] = useState<CheckoutArea>("analytics");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoadingCheckout) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (hasCheckoutError || !checkout) {
    return (
      <div className="space-y-4">
        <Link to="/checkouts" className="inline-flex items-center gap-1.5 text-neutral-500 text-sm">
          <ArrowLeftIcon className="size-4" />
          Voltar para checkouts
        </Link>
        <Card className="px-5 py-6">
          <p className="text-red-600 text-sm">Não foi possível carregar este checkout.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/checkouts"
        className="inline-flex items-center gap-1.5 text-neutral-500 text-sm transition-colors hover:text-neutral-900"
      >
        <ArrowLeftIcon className="size-4" />
        Checkouts
      </Link>

      <PageHeader
        title={checkout.internalTitle}
        description={`Exibido como “${checkout.displayName}” na página pública.`}
        action={
          <div className="flex items-center gap-2">
            <CheckoutPublishToggle checkout={checkout} />
            <Button variant="secondary" size="sm" onClick={() => setIsDialogOpen(true)}>
              <PencilIcon className="size-4" />
              Editar
            </Button>
            <Button variant="danger" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
              <TrashIcon className="size-4" />
              Deletar
            </Button>
          </div>
        }
      />

      <CheckoutPublicLinks checkout={checkout} />

      <Tabs items={TABS} value={area} onChange={setArea} ariaLabel="Áreas do checkout" />

      {area === "analytics" && <CheckoutAnalyticsPanel />}
      {area === "offers" && (
        <CheckoutOffersPanel checkoutId={checkout.id} productId={checkout.productId} />
      )}
      {area === "tracking" && <CheckoutPixelsForm checkoutId={checkout.id} />}
      {area === "design" && <CheckoutDesignCard checkout={checkout} />}

      <CheckoutFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        checkout={checkout}
      />

      <CheckoutDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        checkout={checkout}
        onDeleted={() => {
          setIsDeleteDialogOpen(false);
          void navigate({ to: "/checkouts" });
        }}
      />
    </div>
  );
}
