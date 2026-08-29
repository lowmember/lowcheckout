import type { SessionDto } from "@/application/auth/dtos/session.dto";
import type { SessionIssuer } from "@/application/auth/services/session-issuer";
import type { Clock } from "@/application/shared/ports/clock";
import type { IdGenerator } from "@/application/shared/ports/id-generator";
import type { UseCase } from "@/application/shared/use-case";
import { Account } from "@/domain/accounts/entities/account.entity";
import { AccountNotFoundError } from "@/domain/accounts/errors/account-not-found.error";
import { DocumentAlreadyInUseError } from "@/domain/accounts/errors/document-already-in-use.error";
import type { AccountsRepository } from "@/domain/accounts/repositories/accounts.repository";
import { DevSessionUnavailableError } from "@/domain/sessions/errors/dev-session-unavailable.error";
import { User } from "@/domain/users/entities/user.entity";
import type { UsersRepository } from "@/domain/users/repositories/users.repository";

/**
 * Identidade fixa da sessão de desenvolvimento. É o que torna a rota
 * idempotente: o `unique(email)` de `users` é a chave, então chamar duas vezes
 * reencontra o mesmo usuário e a mesma conta em vez de criar outros.
 */
const DEV_EMAIL = "dev@lowcheckout.local";
const DEV_GOOGLE_SUB = "dev-local-session";
const DEV_USER_NAME = "Usuário de Desenvolvimento";

/**
 * Dados plausíveis do onboarding opcional. O CNPJ tem dígito verificador válido
 * e raiz deliberadamente pouco canônica: os exemplos de manual (11.222.333/…)
 * são justamente os que alguém digita à mão numa conta de teste, e o
 * `unique(document)` faria a rota falhar.
 */
const DEV_BUSINESS_NAME = "Loja de Desenvolvimento";
const DEV_DOCUMENT = "48920175000143";
const DEV_PHONE = "11999999999";

export interface CreateDevSessionInput {
  /** Quando `true`, a conta já nasce `active`, pulando o onboarding. */
  completeOnboarding?: boolean;
}

export type CreateDevSessionUseCase = UseCase<CreateDevSessionInput, SessionDto>;

/**
 * TODO(RF-AUTH-01): atalho **exclusivo de desenvolvimento**, que some em
 * produção. Existe porque o login real é o Google (RF-AUTH-01) e subir o painel
 * localmente não pode depender de configurar OAuth nem de inserir conta na mão
 * pelo `psql`. Quando o OAuth estiver ligado no frontend, esta rota — e o
 * fallback do header `x-account-id` no `lambda.adapter` — saem juntos.
 *
 * A conta nasce em `pending_onboarding` para o fluxo de RF-ONB-01 continuar
 * exercitável; `completeOnboarding: true` a ativa com dados plausíveis.
 */
export class DefaultCreateDevSessionUseCase implements CreateDevSessionUseCase {
  private readonly usersRepository: UsersRepository;
  private readonly accountsRepository: AccountsRepository;
  private readonly sessionIssuer: SessionIssuer;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;
  private readonly enabled: boolean;

  constructor(
    usersRepository: UsersRepository,
    accountsRepository: AccountsRepository,
    sessionIssuer: SessionIssuer,
    idGenerator: IdGenerator,
    clock: Clock,
    enabled: boolean,
  ) {
    this.usersRepository = usersRepository;
    this.accountsRepository = accountsRepository;
    this.sessionIssuer = sessionIssuer;
    this.idGenerator = idGenerator;
    this.clock = clock;
    this.enabled = enabled;
  }

  async execute({ completeOnboarding }: CreateDevSessionInput): Promise<SessionDto> {
    if (!this.enabled) {
      throw new DevSessionUnavailableError();
    }

    const now = this.clock.now();
    const { user, account } = await this.resolveDevIdentity(now);

    user.registerLogin(null, now);
    await this.usersRepository.update(user);

    if (completeOnboarding && account.isOnboardingPending) {
      // Mesma checagem de RF-ONB-02 que o onboarding real faz: sem ela, um
      // documento já usado por outra conta viraria erro de constraint (500) em
      // vez do 409 que descreve o problema.
      const documentOwner = await this.accountsRepository.findByDocument(DEV_DOCUMENT);

      if (documentOwner && documentOwner.accountId !== account.accountId) {
        throw new DocumentAlreadyInUseError();
      }

      account.completeOnboarding(
        {
          businessName: DEV_BUSINESS_NAME,
          document: DEV_DOCUMENT,
          documentType: "cnpj",
          phone: DEV_PHONE,
          sellsWhat: "Produtos digitais",
          estimatedRevenue: "up_to_10k",
        },
        now,
      );

      await this.accountsRepository.update(account);
    }

    return this.sessionIssuer.issue(user, account);
  }

  private async resolveDevIdentity(now: Date): Promise<{ user: User; account: Account }> {
    const existing = await this.findDevIdentity();

    if (existing) {
      return existing;
    }

    try {
      return await this.provision(now);
    } catch (error) {
      // Duas chamadas simultâneas: o `unique(email)` recusa a segunda inserção.
      // Reler é o que fecha a corrida — a rota nunca duplica a conta de dev.
      const afterRace = await this.findDevIdentity();

      if (!afterRace) {
        throw error;
      }

      return afterRace;
    }
  }

  private async findDevIdentity(): Promise<{ user: User; account: Account } | null> {
    const user = await this.usersRepository.findByEmail(DEV_EMAIL);

    if (!user) {
      return null;
    }

    const account = await this.accountsRepository.findById(user.ownerAccountId);

    if (!account) {
      throw new AccountNotFoundError(user.ownerAccountId);
    }

    return { user, account };
  }

  private async provision(now: Date): Promise<{ user: User; account: Account }> {
    const account = Account.create({
      id: this.idGenerator.generate(),
      contactEmail: DEV_EMAIL,
      now,
    });

    const user = User.create({
      id: this.idGenerator.generate(),
      accountId: account.accountId,
      googleSub: DEV_GOOGLE_SUB,
      email: DEV_EMAIL,
      name: DEV_USER_NAME,
      now,
    });

    await this.accountsRepository.create(account);
    await this.usersRepository.create(user);

    return { user, account };
  }
}
