import type { OrderStatus } from "@/features/orders/types/order";
import { Badge, type BadgeTone } from "@/shared/ui/badge";

const STATUS_TONES: Record<OrderStatus, BadgeTone> = {
  awaiting_payment: "warning",
  paid: "success",
  expired: "danger",
  canceled: "neutral",
  refunded: "info",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_payment: "Aguardando pagamento",
  paid: "Aprovada",
  expired: "Expirada",
  canceled: "Cancelada",
  refunded: "Reembolsada",
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>;
}
