import { EntityNotFoundError } from "@/domain/shared/errors/domain.error";

export class OrderNotFoundError extends EntityNotFoundError {
  override readonly code = "order_not_found";

  constructor(orderId: string) {
    super(`Pedido ${orderId} não encontrado`);
  }
}
