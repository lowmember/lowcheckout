import { EntityNotFoundError } from "@/domain/shared/errors/domain.error";

export class CheckoutNotFoundError extends EntityNotFoundError {
  override readonly code = "checkout_not_found";

  constructor(checkoutId: string) {
    super(`Checkout ${checkoutId} não encontrado`);
  }
}
