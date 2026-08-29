import type { CheckoutDto } from "@/application/checkouts/dtos/checkout.dto";
import { toCheckoutDto } from "@/application/checkouts/mappers/checkout.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { UseCase } from "@/application/shared/use-case";
import { CheckoutCustomizationRevision } from "@/domain/checkouts/entities/checkout-customization-revision.entity";
import { CheckoutNotFoundError } from "@/domain/checkouts/errors/checkout-not-found.error";
import type { CheckoutCustomizationRevisionsRepository } from "@/domain/checkouts/repositories/checkout-customization-revisions.repository";
import type { CheckoutsRepository } from "@/domain/checkouts/repositories/checkouts.repository";
import { CheckoutCustomization } from "@/domain/checkouts/value-objects/checkout-customization";
import type { CustomizationSource } from "@/domain/checkouts/value-objects/customization-source";

export interface UpdateCheckoutCustomizationInput {
  accountId: string;
  userId: string;
  checkoutId: string;
  /** `builder` (RF-CHK-07) ou `json_import` (RF-CHK-08) — mesma coluna, duas origens. */
  source: CustomizationSource;
  customization: Record<string, unknown>;
}

export type UpdateCheckoutCustomizationUseCase = UseCase<
  UpdateCheckoutCustomizationInput,
  CheckoutDto
>;

/**
 * Escrita única da customização. A substituição é **total** — o que não vier no
 * corpo volta ao tema padrão —, e toda escrita deixa uma revisão com a origem
 * correta: é ela que dá reversão ao "Importar", que sobrescreve o estado atual.
 */
export class DefaultUpdateCheckoutCustomizationUseCase
  implements UpdateCheckoutCustomizationUseCase
{
  private readonly checkoutsRepository: CheckoutsRepository;
  private readonly revisionsRepository: CheckoutCustomizationRevisionsRepository;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;

  constructor(
    checkoutsRepository: CheckoutsRepository,
    revisionsRepository: CheckoutCustomizationRevisionsRepository,
    idGenerator: IdGenerator,
    clock: Clock,
  ) {
    this.checkoutsRepository = checkoutsRepository;
    this.revisionsRepository = revisionsRepository;
    this.idGenerator = idGenerator;
    this.clock = clock;
  }

  async execute(input: UpdateCheckoutCustomizationInput): Promise<CheckoutDto> {
    const checkout = await this.checkoutsRepository.findById(input.accountId, input.checkoutId);

    if (!checkout) {
      throw new CheckoutNotFoundError(input.checkoutId);
    }

    // Valida contra o catálogo antes de qualquer alteração de estado (RF-CHK-08).
    const customization = CheckoutCustomization.create(input.customization);
    const now = this.clock.now();

    checkout.replaceCustomization(customization, now);

    await this.checkoutsRepository.update(checkout);

    await this.revisionsRepository.create(
      CheckoutCustomizationRevision.create({
        id: this.idGenerator.generate(),
        checkoutId: checkout.checkoutId,
        customization: customization.toProps(),
        source: input.source,
        createdByUserId: input.userId,
        now,
      }),
    );

    return toCheckoutDto(checkout);
  }
}
