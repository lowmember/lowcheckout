import { createFileRoute, Link } from "@tanstack/react-router";

import { CheckoutList, checkoutQueries } from "@/features/checkouts";
import { cn } from "@/shared/lib/cn";
import { PlusIcon } from "@/shared/ui/icons";
import { PageHeader } from "@/shared/ui/page-header";

export const Route = createFileRoute("/_app/checkouts/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(checkoutQueries.list()).catch(() => null),
  component: CheckoutsPage,
});

/** Criar checkout é navegação (abre o fluxo em etapas), então é um link de verdade. */
function NewCheckoutLink({ label }: { label: string }) {
  return (
    <Link
      to="/checkouts/novo"
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-lg bg-neutral-800 px-3 font-medium text-sm text-white",
        "transition-[background-color,scale] duration-200 ease-out active:scale-[0.99]",
        "hover:bg-neutral-900",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
      )}
    >
      <PlusIcon className="size-4" />
      {label}
    </Link>
  );
}

function CheckoutsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Checkouts"
        description="Cada checkout é uma página de venda de um produto. Ofertas vinculadas viram URLs públicas."
        action={<NewCheckoutLink label="Novo checkout" />}
      />

      <CheckoutList emptyAction={<NewCheckoutLink label="Criar primeiro checkout" />} />
    </div>
  );
}
