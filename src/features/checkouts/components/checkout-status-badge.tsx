import type { CheckoutStatus } from "@/features/checkouts/types/checkout";
import { Badge, type BadgeTone } from "@/shared/ui/badge";

const STATUS_TONES: Record<CheckoutStatus, BadgeTone> = {
  draft: "neutral",
  active: "success",
  paused: "warning",
  archived: "danger",
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
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>;
}
