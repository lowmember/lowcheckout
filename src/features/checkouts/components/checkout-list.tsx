import { Link } from "@tanstack/react-router";

import { CheckoutStatusBadge } from "@/features/checkouts/components/checkout-status-badge";
import { useCheckouts } from "@/features/checkouts/hooks/use-checkouts";
import type { ListCheckoutsParams } from "@/features/checkouts/types/checkout";

function formatPrice(priceInCents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(priceInCents / 100);
}

interface CheckoutListProps {
  params?: ListCheckoutsParams;
}

export function CheckoutList({ params }: CheckoutListProps) {
  const { checkouts, isLoadingCheckouts, hasCheckoutsError } = useCheckouts(params);

  if (isLoadingCheckouts) {
    return <p className="text-neutral-500 text-sm">Carregando checkouts...</p>;
  }

  if (hasCheckoutsError) {
    return <p className="text-red-600 text-sm">Não foi possível carregar os checkouts.</p>;
  }

  if (checkouts.length === 0) {
    return <p className="text-neutral-500 text-sm">Nenhum checkout cadastrado ainda.</p>;
  }

  return (
    <ul className="divide-y divide-neutral-200">
      {checkouts.map((checkout) => (
        <li key={checkout.id} className="flex items-center justify-between gap-4 py-3">
          <div>
            <Link
              to="/checkouts/$checkoutId"
              params={{ checkoutId: checkout.id }}
              className="font-medium text-neutral-900 hover:underline"
            >
              {checkout.name}
            </Link>
            <p className="text-neutral-500 text-sm">/{checkout.slug}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-700 text-sm">
              {formatPrice(checkout.priceInCents, checkout.currency)}
            </span>
            <CheckoutStatusBadge status={checkout.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}
