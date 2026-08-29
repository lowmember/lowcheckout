import type { UseCase } from "@/application/shared/use-case";
import { CheckoutNotFoundError } from "@/domain/checkouts/errors/checkout-not-found.error";
import type { CheckoutsRepository } from "@/domain/checkouts/repositories/checkouts.repository";

export interface DeleteCheckoutInput {
  accountId: string;
  checkoutId: string;
}

export type DeleteCheckoutUseCase = UseCase<DeleteCheckoutInput, void>;

export class DefaultDeleteCheckoutUseCase implements DeleteCheckoutUseCase {
  private readonly checkoutsRepository: CheckoutsRepository;

  constructor(checkoutsRepository: CheckoutsRepository) {
    this.checkoutsRepository = checkoutsRepository;
  }

  async execute({ accountId, checkoutId }: DeleteCheckoutInput): Promise<void> {
    const deleted = await this.checkoutsRepository.delete(accountId, checkoutId);

    if (!deleted) {
      throw new CheckoutNotFoundError(checkoutId);
    }
  }
}
