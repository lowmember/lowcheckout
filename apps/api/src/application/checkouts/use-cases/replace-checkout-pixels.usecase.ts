import type { CheckoutPixelDto } from "@/application/checkouts/dtos/checkout-pixel.dto";
import { toCheckoutPixelDto } from "@/application/checkouts/mappers/checkout-pixel.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { Encrypter } from "@/application/shared/ports/encrypter";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { UseCase } from "@/application/shared/use-case";
import { CheckoutPixel } from "@/domain/checkouts/entities/checkout-pixel.entity";
import { CheckoutNotFoundError } from "@/domain/checkouts/errors/checkout-not-found.error";
import type { CheckoutPixelsRepository } from "@/domain/checkouts/repositories/checkout-pixels.repository";
import type { CheckoutsRepository } from "@/domain/checkouts/repositories/checkouts.repository";
import type { PixelProvider } from "@/domain/checkouts/value-objects/pixel-provider";
import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

export interface CheckoutPixelInput {
  provider: PixelProvider;
  externalId: string;
  /** Em claro na entrada; cifrado antes de chegar ao banco. */
  accessToken?: string | null;
  config?: Record<string, unknown> | null;
  isEnabled?: boolean;
}

export interface ReplaceCheckoutPixelsInput {
  accountId: string;
  checkoutId: string;
  pixels: CheckoutPixelInput[];
}

export type ReplaceCheckoutPixelsUseCase = UseCase<ReplaceCheckoutPixelsInput, CheckoutPixelDto[]>;

/**
 * RF-CHK-10. A escrita é do conjunto inteiro: o provider que **não** vier na
 * lista é removido, que é como o usuário "remove o pixel" e faz a página
 * pública parar de carregá-lo.
 */
export class DefaultReplaceCheckoutPixelsUseCase implements ReplaceCheckoutPixelsUseCase {
  private readonly checkoutPixelsRepository: CheckoutPixelsRepository;
  private readonly checkoutsRepository: CheckoutsRepository;
  private readonly encrypter: Encrypter;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;

  constructor(
    checkoutPixelsRepository: CheckoutPixelsRepository,
    checkoutsRepository: CheckoutsRepository,
    encrypter: Encrypter,
    idGenerator: IdGenerator,
    clock: Clock,
  ) {
    this.checkoutPixelsRepository = checkoutPixelsRepository;
    this.checkoutsRepository = checkoutsRepository;
    this.encrypter = encrypter;
    this.idGenerator = idGenerator;
    this.clock = clock;
  }

  async execute(input: ReplaceCheckoutPixelsInput): Promise<CheckoutPixelDto[]> {
    const checkout = await this.checkoutsRepository.findById(input.accountId, input.checkoutId);

    if (!checkout) {
      throw new CheckoutNotFoundError(input.checkoutId);
    }

    this.assertOneEntryPerProvider(input.pixels);

    const existing = await this.checkoutPixelsRepository.findByCheckout(
      input.accountId,
      input.checkoutId,
    );
    const existingByProvider = new Map(existing.map((pixel) => [pixel.pixelProvider, pixel]));
    const now = this.clock.now();
    const saved: CheckoutPixel[] = [];

    for (const entry of input.pixels) {
      const current = existingByProvider.get(entry.provider);
      // Token ausente na entrada significa "mantém o que já estava".
      const accessToken =
        entry.accessToken === undefined
          ? (current?.encryptedAccessToken ?? null)
          : entry.accessToken === null
            ? null
            : this.encrypter.encrypt(entry.accessToken);

      if (current) {
        current.update(
          {
            externalId: entry.externalId,
            accessToken,
            config: entry.config,
            isEnabled: entry.isEnabled,
          },
          now,
        );

        await this.checkoutPixelsRepository.update(current);
        saved.push(current);

        continue;
      }

      const pixel = CheckoutPixel.create({
        id: this.idGenerator.generate(),
        accountId: input.accountId,
        checkoutId: input.checkoutId,
        provider: entry.provider,
        externalId: entry.externalId,
        accessToken,
        config: entry.config,
        isEnabled: entry.isEnabled,
        now,
      });

      await this.checkoutPixelsRepository.create(pixel);
      saved.push(pixel);
    }

    const keptProviders = new Set(input.pixels.map((entry) => entry.provider));
    const removedProviders = existing
      .map((pixel) => pixel.pixelProvider)
      .filter((provider) => !keptProviders.has(provider));

    if (removedProviders.length > 0) {
      await this.checkoutPixelsRepository.deleteByProviders(
        input.accountId,
        input.checkoutId,
        removedProviders,
      );
    }

    return saved.map(toCheckoutPixelDto);
  }

  /** O `unique(checkout_id, provider)` só admite um registro por provider. */
  private assertOneEntryPerProvider(pixels: readonly CheckoutPixelInput[]): void {
    const providers = new Set<PixelProvider>();

    for (const { provider } of pixels) {
      if (providers.has(provider)) {
        throw new InvariantViolationError(`Há mais de um pixel informado para "${provider}"`);
      }

      providers.add(provider);
    }
  }
}
