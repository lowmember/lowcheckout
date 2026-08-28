import type { CheckoutStatus } from "@/features/checkouts/types/checkout";
import { cn } from "@/shared/lib/cn";

const STATUS_STYLES: Record<CheckoutStatus, string> = {
  draft: "bg-neutral-100 text-neutral-700",
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  archived: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<CheckoutStatus, string> = {
  draft: "Rascunho",
  active: "Ativo",
  paused: "Pausado",
  archived: "Arquivado",
};

interface CheckoutStatusBadgeProps {
  status: CheckoutStatus;
}

export function CheckoutStatusBadge({ status }: CheckoutStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
