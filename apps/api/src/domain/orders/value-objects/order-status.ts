import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

export const ORDER_STATUSES = [
  "awaiting_payment",
  "paid",
  "expired",
  "canceled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Transições válidas (RF-PAG-02 + modelo de dados). `expired → paid` existe
 * porque o job de expiração e o webhook são assíncronos e podem se cruzar: o
 * pedido pode ser expirado segundos antes de chegar a confirmação de um PIX
 * pago dentro do prazo. Nesse conflito o pagamento confirmado prevalece (S14).
 */
const VALID_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  awaiting_payment: ["paid", "expired", "canceled"],
  expired: ["paid"],
  paid: ["refunded"],
  canceled: [],
  refunded: [],
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function toOrderStatus(value: string): OrderStatus {
  if (!isOrderStatus(value)) {
    throw new InvariantViolationError(`"${value}" não é um status de pedido válido`);
  }

  return value;
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
