import { createFileRoute, Link } from "@tanstack/react-router";

import { CheckoutCreateWizard } from "@/features/checkouts";
import { productQueries } from "@/features/products";
import { ArrowLeftIcon } from "@/shared/ui/icons";
import { PageHeader } from "@/shared/ui/page-header";

export const Route = createFileRoute("/_builder/checkouts/novo")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(productQueries.list()).catch(() => null),
  component: NewCheckoutPage,
});

function NewCheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
      <Link
        to="/checkouts"
        className="inline-flex items-center gap-1.5 text-neutral-500 text-sm transition-colors hover:text-neutral-900"
      >
        <ArrowLeftIcon className="size-4" />
        Checkouts
      </Link>

      <PageHeader
        title="Criar checkout"
        description="Escolha por onde começar. Você pode mudar tudo depois no editor visual."
      />

      <CheckoutCreateWizard />
    </div>
  );
}
