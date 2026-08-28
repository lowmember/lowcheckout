import { createFileRoute } from "@tanstack/react-router";

import { CheckoutStatusBadge, checkoutQueries, useCheckout } from "@/features/checkouts";
import { PageHeader } from "@/shared/ui/page-header";

export const Route = createFileRoute("/_app/checkouts/$checkoutId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(checkoutQueries.detail(params.checkoutId)),
  component: CheckoutDetailsPage,
});

function CheckoutDetailsPage() {
  const { checkoutId } = Route.useParams();
  const { checkout, isLoadingCheckout } = useCheckout(checkoutId);

  if (isLoadingCheckout || !checkout) {
    return <p className="text-neutral-500 text-sm">Carregando checkout...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={checkout.name}
        description={`/${checkout.slug}`}
        action={<CheckoutStatusBadge status={checkout.status} />}
      />
    </div>
  );
}
