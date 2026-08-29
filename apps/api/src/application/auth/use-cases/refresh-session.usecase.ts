import type { SessionDto } from "@/application/auth/dtos/session.dto";
import type { SessionIssuer } from "@/application/auth/services/session-issuer";
import type { Clock } from "@/application/shared/ports/clock";
import type { Hasher } from "@/application/shared/ports/hasher";
import type { UseCase } from "@/application/shared/use-case";
import { AccountUnavailableError } from "@/domain/accounts/errors/account-unavailable.error";
import type { AccountsRepository } from "@/domain/accounts/repositories/accounts.repository";
import { InvalidRefreshTokenError } from "@/domain/sessions/errors/invalid-refresh-token.error";
import type { RefreshTokensRepository } from "@/domain/sessions/repositories/refresh-tokens.repository";
import type { UsersRepository } from "@/domain/users/repositories/users.repository";

export interface RefreshSessionInput {
  refreshToken: string;
}

export type RefreshSessionUseCase = UseCase<RefreshSessionInput, SessionDto>;

/**
 * RF-AUTH-03: renova a sessão sem refazer o consentimento do Google. O refresh
 * token é **rotacionado** — o usado é revogado na mesma operação, de modo que
 * reapresentá-lo não vale nada.
 */
export class DefaultRefreshSessionUseCase implements RefreshSessionUseCase {
  private readonly refreshTokensRepository: RefreshTokensRepository;
  private readonly usersRepository: UsersRepository;
  private readonly accountsRepository: AccountsRepository;
  private readonly sessionIssuer: SessionIssuer;
  private readonly hasher: Hasher;
  private readonly clock: Clock;

  constructor(
    refreshTokensRepository: RefreshTokensRepository,
    usersRepository: UsersRepository,
    accountsRepository: AccountsRepository,
    sessionIssuer: SessionIssuer,
    hasher: Hasher,
    clock: Clock,
  ) {
    this.refreshTokensRepository = refreshTokensRepository;
    this.usersRepository = usersRepository;
    this.accountsRepository = accountsRepository;
    this.sessionIssuer = sessionIssuer;
    this.hasher = hasher;
    this.clock = clock;
  }

  async execute({ refreshToken }: RefreshSessionInput): Promise<SessionDto> {
    const now = this.clock.now();
    const stored = await this.refreshTokensRepository.findByTokenHash(
      this.hasher.hash(refreshToken),
    );

    if (!stored?.isUsable(now)) {
      throw new InvalidRefreshTokenError();
    }

    const user = await this.usersRepository.findById(stored.ownerUserId);

    if (!user) {
      throw new InvalidRefreshTokenError();
    }

    const account = await this.accountsRepository.findById(user.ownerAccountId);

    if (!account) {
      throw new InvalidRefreshTokenError();
    }

    if (account.currentStatus === "deleted") {
      throw new AccountUnavailableError(account.currentStatus);
    }

    stored.revoke(now);
    await this.refreshTokensRepository.update(stored);

    return this.sessionIssuer.issue(user, account);
  }
}
