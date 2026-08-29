import type { OrderStatus } from "@/domain/orders/value-objects/order-status";
import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

export class InvalidOrderTransitionError extends InvariantViolationError {
  override readonly code = "invalid_order_transition";

  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Um pedido "${from}" não pode passar para "${to}"`);
  }
}
