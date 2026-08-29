import type { Clock } from "@/application/shared/ports/clock";
import type { Hasher } from "@/application/shared/ports/hasher";
import type { UseCase } from "@/application/shared/use-case";
import type { RefreshTokensRepository } from "@/domain/sessions/repositories/refresh-tokens.repository";

export interface LogoutInput {
  refreshToken: string;
}

export type LogoutUseCase = UseCase<LogoutInput, void>;

/**
 * RF-AUTH-04: invalida a sessão corrente e não toca em mais nada. É idempotente
 * de propósito — token desconhecido também "desloga", para não virar um oráculo
 * de quais tokens existem.
 */
export class DefaultLogoutUseCase implements LogoutUseCase {
  private readonly refreshTokensRepository: RefreshTokensRepository;
  private readonly hasher: Hasher;
  private readonly clock: Clock;

  constructor(refreshTokensRepository: RefreshTokensRepository, hasher: Hasher, clock: Clock) {
    this.refreshTokensRepository = refreshTokensRepository;
    this.hasher = hasher;
    this.clock = clock;
  }

  async execute({ refreshToken }: LogoutInput): Promise<void> {
    const stored = await this.refreshTokensRepository.findByTokenHash(
      this.hasher.hash(refreshToken),
    );

    if (!stored) {
      return;
    }

    stored.revoke(this.clock.now());

    await this.refreshTokensRepository.update(stored);
  }
}
