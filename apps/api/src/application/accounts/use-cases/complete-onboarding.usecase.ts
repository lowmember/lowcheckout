import type { AccountDto } from "@/application/accounts/dtos/account.dto";
import { toAccountDto } from "@/application/accounts/mappers/account.mapper";
import type { Clock } from "@/application/shared/ports/clock";
import type { UseCase } from "@/application/shared/use-case";
import { AccountNotFoundError } from "@/domain/accounts/errors/account-not-found.error";
import { DocumentAlreadyInUseError } from "@/domain/accounts/errors/document-already-in-use.error";
import type { AccountsRepository } from "@/domain/accounts/repositories/accounts.repository";
import type { AccountDocumentType } from "@/domain/accounts/value-objects/account-document-type";
import type { AccountRevenueRange } from "@/domain/accounts/value-objects/account-revenue-range";
import { Document } from "@/domain/shared/value-objects/document";

export interface CompleteOnboardingInput {
  accountId: string;
  businessName: string;
  document: string;
  documentType: AccountDocumentType;
  phone: string;
  sellsWhat?: string | null;
  estimatedRevenue?: AccountRevenueRange | null;
}

export type CompleteOnboardingUseCase = UseCase<CompleteOnboardingInput, AccountDto>;

/**
 * RF-ONB-01/02: acontece uma vez, sem estado parcial. Ao concluir, a conta é
 * ativada — e a ativação é onde a invariante (b) é cobrada.
 */
export class DefaultCompleteOnboardingUseCase implements CompleteOnboardingUseCase {
  private readonly accountsRepository: AccountsRepository;
  private readonly clock: Clock;

  constructor(accountsRepository: AccountsRepository, clock: Clock) {
    this.accountsRepository = accountsRepository;
    this.clock = clock;
  }

  async execute(input: CompleteOnboardingInput): Promise<AccountDto> {
    const account = await this.accountsRepository.findById(input.accountId);

    if (!account) {
      throw new AccountNotFoundError(input.accountId);
    }

    // Normaliza e valida dígitos verificadores antes de perguntar ao banco.
    const document = Document.create(input.document, input.documentType);
    const owner = await this.accountsRepository.findByDocument(document.toString());

    if (owner && owner.accountId !== account.accountId) {
      throw new DocumentAlreadyInUseError();
    }

    account.completeOnboarding(
      {
        businessName: input.businessName,
        document: document.toString(),
        documentType: input.documentType,
        phone: input.phone,
        sellsWhat: input.sellsWhat,
        estimatedRevenue: input.estimatedRevenue,
      },
      this.clock.now(),
    );

    await this.accountsRepository.update(account);

    return toAccountDto(account);
  }
}
