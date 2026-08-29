import { EntityNotFoundError } from "@/domain/shared/errors/domain.error";

export class ProductNotFoundError extends EntityNotFoundError {
  override readonly code = "product_not_found";

  constructor(productId: string) {
    super(`Produto ${productId} não encontrado`);
  }
}
