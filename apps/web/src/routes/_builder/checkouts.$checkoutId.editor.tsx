import { createFileRoute, Link } from "@tanstack/react-router";

import { CheckoutEditor, checkoutQueries, useCheckout } from "@/features/checkouts";
import { ArrowLeftIcon } from "@/shared/ui/icons";
import { Skeleton } from "@/shared/ui/skeleton";

export const Route = createFileRoute("/_builder/checkouts/$checkoutId/editor")({
  loader: ({ context, params }) =>
    context.queryClient
      .ensureQueryData(checkoutQueries.detail(params.checkoutId))
      .catch(() => null),
  component: CheckoutEditorPage,
});

function CheckoutEditorPage() {
  const { checkoutId } = Route.useParams();
  const { checkout, isLoadingCheckout, hasCheckoutError } = useCheckout(checkoutId);

  if (isLoadingCheckout) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[70vh] w-full" />
      </div>
    );
  }

  if (hasCheckoutError || !checkout) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-red-600 text-sm">Não foi possível carregar este checkout.</p>
        <Link
          to="/checkouts"
          className="inline-flex items-center gap-1.5 text-neutral-500 text-sm transition-colors hover:text-neutral-900"
        >
          <ArrowLeftIcon className="size-4" />
          Voltar para checkouts
        </Link>
      </div>
    );
  }

  return <CheckoutEditor checkout={checkout} />;
}
