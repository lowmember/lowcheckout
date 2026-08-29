import type { SessionDto } from "@/application/auth/dtos/session.dto";
import type { GoogleIdentityVerifier } from "@/application/auth/ports/google-identity-verifier";
import type { SessionIssuer } from "@/application/auth/services/session-issuer";
import type { Clock } from "@/application/shared/ports/clock";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { UseCase } from "@/application/shared/use-case";
import { Account } from "@/domain/accounts/entities/account.entity";
import { AccountNotFoundError } from "@/domain/accounts/errors/account-not-found.error";
import { AccountUnavailableError } from "@/domain/accounts/errors/account-unavailable.error";
import type { AccountsRepository } from "@/domain/accounts/repositories/accounts.repository";
import { GoogleEmailNotVerifiedError } from "@/domain/sessions/errors/google-email-not-verified.error";
import { User } from "@/domain/users/entities/user.entity";
import type { UsersRepository } from "@/domain/users/repositories/users.repository";

export interface AuthenticateWithGoogleInput {
  idToken: string;
}

export type AuthenticateWithGoogleUseCase = UseCase<AuthenticateWithGoogleInput, SessionDto>;

/**
 * RF-AUTH-01 + RF-AUTH-02: valida o id token do Google e, no primeiro acesso de
 * um e-mail desconhecido, provisiona conta (em `pending_onboarding`) e usuário.
 * Segundo login nunca cria registro novo.
 */
export class DefaultAuthenticateWithGoogleUseCase implements AuthenticateWithGoogleUseCase {
  private readonly googleIdentityVerifier: GoogleIdentityVerifier;
  private readonly usersRepository: UsersRepository;
  private readonly accountsRepository: AccountsRepository;
  private readonly sessionIssuer: SessionIssuer;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;

  constructor(
    googleIdentityVerifier: GoogleIdentityVerifier,
    usersRepository: UsersRepository,
    accountsRepository: AccountsRepository,
    sessionIssuer: SessionIssuer,
    idGenerator: IdGenerator,
    clock: Clock,
  ) {
    this.googleIdentityVerifier = googleIdentityVerifier;
    this.usersRepository = usersRepository;
    this.accountsRepository = accountsRepository;
    this.sessionIssuer = sessionIssuer;
    this.idGenerator = idGenerator;
    this.clock = clock;
  }

  async execute({ idToken }: AuthenticateWithGoogleInput): Promise<SessionDto> {
    const identity = await this.googleIdentityVerifier.verify(idToken);

    if (!identity.emailVerified) {
      throw new GoogleEmailNotVerifiedError();
    }

    const now = this.clock.now();
    const existingUser = await this.findExistingUser(identity.googleSub, identity.email);

    if (!existingUser) {
      return this.provision(identity.googleSub, identity, now);
    }

    const account = await this.accountsRepository.findById(existingUser.ownerAccountId);

    if (!account) {
      throw new AccountNotFoundError(existingUser.ownerAccountId);
    }

    // Conta excluída não volta pelo login; desativada entra e é informada (RF-CONF-03).
    if (account.currentStatus === "deleted") {
      throw new AccountUnavailableError(account.currentStatus);
    }

    existingUser.relinkGoogleSub(identity.googleSub, now);
    existingUser.registerLogin(identity.avatarUrl, now);

    await this.usersRepository.update(existingUser);

    return this.sessionIssuer.issue(existingUser, account);
  }

  private async findExistingUser(googleSub: string, email: string): Promise<User | null> {
    const byGoogleSub = await this.usersRepository.findByGoogleSub(googleSub);

    if (byGoogleSub) {
      return byGoogleSub;
    }

    // O mesmo e-mail é sempre o mesmo usuário, mesmo que o `sub` mude (RF-AUTH-01).
    return this.usersRepository.findByEmail(email);
  }

  private async provision(
    googleSub: string,
    identity: { email: string; name?: string | null; avatarUrl?: string | null },
    now: Date,
  ): Promise<SessionDto> {
    const account = Account.create({
      id: this.idGenerator.generate(),
      // Semente do e-mail de contato; o usuário pode trocá-lo depois (RF-CONF-01).
      contactEmail: identity.email,
      now,
    });

    const user = User.create({
      id: this.idGenerator.generate(),
      accountId: account.accountId,
      googleSub,
      email: identity.email,
      name: identity.name,
      avatarUrl: identity.avatarUrl,
      now,
    });

    await this.accountsRepository.create(account);
    await this.usersRepository.create(user);

    return this.sessionIssuer.issue(user, account);
  }
}
