import type { CheckoutDto } from "@/application/checkouts/dtos/checkout.dto";
import { toCheckoutDto } from "@/application/checkouts/mappers/checkout.mapper";
import type { PageDto } from "@/application/shared/dtos/page.dto";
import type { UseCase } from "@/application/shared/use-case";
import type { CheckoutsRepository } from "@/domain/checkouts/repositories/checkouts.repository";
import type { CheckoutStatus } from "@/domain/checkouts/value-objects/checkout-status";

export interface ListCheckoutsInput {
  accountId: string;
  page: number;
  perPage: number;
  status?: CheckoutStatus;
  productId?: string;
  search?: string;
}

export type ListCheckoutsUseCase = UseCase<ListCheckoutsInput, PageDto<CheckoutDto>>;

export class DefaultListCheckoutsUseCase implements ListCheckoutsUseCase {
  private readonly checkoutsRepository: CheckoutsRepository;

  constructor(checkoutsRepository: CheckoutsRepository) {
    this.checkoutsRepository = checkoutsRepository;
  }

  async execute(input: ListCheckoutsInput): Promise<PageDto<CheckoutDto>> {
    const { items, total } = await this.checkoutsRepository.findMany(input);

    return {
      data: items.map(toCheckoutDto),
      meta: { page: input.page, perPage: input.perPage, total },
    };
  }
}
