import type { CheckoutDto } from "@/application/checkouts/dtos/checkout.dto";
import { toCheckoutDto } from "@/application/checkouts/mappers/checkout.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { Hasher } from "@/application/shared/ports/hasher";
import type { Mailer } from "@/application/shared/ports/mailer";
import type { VerificationCodeGenerator } from "@/application/shared/ports/verification-code-generator";
import type { UseCase } from "@/application/shared/use-case";
import { CheckoutNotFoundError } from "@/domain/checkouts/errors/checkout-not-found.error";
import type { CheckoutsRepository } from "@/domain/checkouts/repositories/checkouts.repository";

/** Janela curta: o código chega por e-mail e é digitado na hora. */
const CODE_TTL_IN_MINUTES = 15;

export interface RequestCheckoutContactEmailVerificationInput {
  accountId: string;
  checkoutId: string;
  contactEmail: string;
}

export type RequestCheckoutContactEmailVerificationUseCase = UseCase<
  RequestCheckoutContactEmailVerificationInput,
  CheckoutDto
>;

/**
 * RF-CHK-11. O e-mail de contato do checkout só passa a valer depois que o
 * dono do endereço digita o código — por isso a escrita abre um pedido de
 * confirmação em vez de gravar o endereço direto.
 */
export class DefaultRequestCheckoutContactEmailVerificationUseCase
  implements RequestCheckoutContactEmailVerificationUseCase
{
  private readonly checkoutsRepository: CheckoutsRepository;
  private readonly verificationCodeGenerator: VerificationCodeGenerator;
  private readonly hasher: Hasher;
  private readonly mailer: Mailer;
  private readonly clock: Clock;

  constructor(
    checkoutsRepository: CheckoutsRepository,
    verificationCodeGenerator: VerificationCodeGenerator,
    hasher: Hasher,
    mailer: Mailer,
    clock: Clock,
  ) {
    this.checkoutsRepository = checkoutsRepository;
    this.verificationCodeGenerator = verificationCodeGenerator;
    this.hasher = hasher;
    this.mailer = mailer;
    this.clock = clock;
  }

  async execute(input: RequestCheckoutContactEmailVerificationInput): Promise<CheckoutDto> {
    const checkout = await this.checkoutsRepository.findById(input.accountId, input.checkoutId);

    if (!checkout) {
      throw new CheckoutNotFoundError(input.checkoutId);
    }

    const now = this.clock.now();
    const code = this.verificationCodeGenerator.generate();
    const expiresAt = new Date(now.getTime() + CODE_TTL_IN_MINUTES * 60_000);

    checkout.startContactEmailVerification(
      input.contactEmail,
      this.hasher.hash(code),
      expiresAt,
      now,
    );

    await this.checkoutsRepository.update(checkout);

    await this.mailer.send({
      to: checkout.toSnapshot().pendingContactEmail ?? input.contactEmail,
      subject: `Confirme o e-mail de contato de “${checkout.currentDisplayName}”`,
      textBody: [
        `Seu código de confirmação é ${code}.`,
        `Ele vale por ${CODE_TTL_IN_MINUTES} minutos.`,
        "",
        "Se você não pediu esta confirmação, ignore esta mensagem.",
      ].join("\n"),
    });

    return toCheckoutDto(checkout);
  }
}
