import { toAccountDto } from "@/application/accounts/mappers/account.mapper";
import type { SessionDto } from "@/application/auth/dtos/session.dto";
import type { AccessTokenIssuer } from "@/application/auth/ports/access-token-issuer";
import type { Clock } from "@/application/shared/ports/clock";
import type { Hasher } from "@/application/shared/ports/hasher";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { SecretGenerator } from "@/application/shared/ports/secret-generator";
import { toUserDto } from "@/application/users/mappers/user.mapper";
import type { Account } from "@/domain/accounts/entities/account.entity";
import { RefreshToken } from "@/domain/sessions/entities/refresh-token.entity";
import type { RefreshTokensRepository } from "@/domain/sessions/repositories/refresh-tokens.repository";
import type { User } from "@/domain/users/entities/user.entity";

/**
 * Emite a sessão da API (RF-AUTH-03): access token curto assinado + refresh
 * token opaco persistido **hasheado**. Compartilhado por login e refresh, para
 * que os dois produzam exatamente o mesmo contrato.
 */
export interface SessionIssuer {
  issue(user: User, account: Account): Promise<SessionDto>;
}

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export class DefaultSessionIssuer implements SessionIssuer {
  private readonly accessTokenIssuer: AccessTokenIssuer;
  private readonly refreshTokensRepository: RefreshTokensRepository;
  private readonly secretGenerator: SecretGenerator;
  private readonly hasher: Hasher;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;
  private readonly refreshTokenTtlDays: number;

  constructor(
    accessTokenIssuer: AccessTokenIssuer,
    refreshTokensRepository: RefreshTokensRepository,
    secretGenerator: SecretGenerator,
    hasher: Hasher,
    idGenerator: IdGenerator,
    clock: Clock,
    refreshTokenTtlDays: number,
  ) {
    this.accessTokenIssuer = accessTokenIssuer;
    this.refreshTokensRepository = refreshTokensRepository;
    this.secretGenerator = secretGenerator;
    this.hasher = hasher;
    this.idGenerator = idGenerator;
    this.clock = clock;
    this.refreshTokenTtlDays = refreshTokenTtlDays;
  }

  async issue(user: User, account: Account): Promise<SessionDto> {
    const now = this.clock.now();

    const accessToken = await this.accessTokenIssuer.issue({
      accountId: account.accountId,
      userId: user.userId,
    });

    const refreshTokenValue = this.secretGenerator.generate();

    await this.refreshTokensRepository.create(
      RefreshToken.create({
        id: this.idGenerator.generate(),
        userId: user.userId,
        tokenHash: this.hasher.hash(refreshTokenValue),
        expiresAt: new Date(now.getTime() + this.refreshTokenTtlDays * MILLISECONDS_PER_DAY),
        now,
      }),
    );

    return {
      tokenType: "Bearer",
      accessToken: accessToken.token,
      expiresIn: accessToken.expiresInSeconds,
      refreshToken: refreshTokenValue,
      user: toUserDto(user),
      account: toAccountDto(account),
      onboardingPending: account.isOnboardingPending,
    };
  }
}
