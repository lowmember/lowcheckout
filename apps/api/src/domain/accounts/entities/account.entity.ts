import { AccountUnavailableError } from "@/domain/accounts/errors/account-unavailable.error";
import { DocumentIsImmutableError } from "@/domain/accounts/errors/document-is-immutable.error";
import { OnboardingPendingError } from "@/domain/accounts/errors/onboarding-pending.error";
import type { AccountDocumentType } from "@/domain/accounts/value-objects/account-document-type";
import {
  type AccountRevenueRange,
  toAccountRevenueRange,
} from "@/domain/accounts/value-objects/account-revenue-range";
import {
  type AccountStatus,
  toAccountStatus,
} from "@/domain/accounts/value-objects/account-status";
import { InvariantViolationError } from "@/domain/shared/errors/domain.error";
import { Document } from "@/domain/shared/value-objects/document";
import { Email } from "@/domain/shared/value-objects/email";
import { Phone } from "@/domain/shared/value-objects/phone";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface AccountSnapshot {
  id: string;
  businessName: string | null;
  document: string | null;
  documentType: AccountDocumentType | null;
  phone: string | null;
  contactEmail: string | null;
  sellsWhat: string | null;
  estimatedRevenue: AccountRevenueRange | null;
  status: AccountStatus;
  onboardingCompletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateAccountProps {
  id: string;
  contactEmail?: string | null;
  now: Date;
}

export interface CompleteOnboardingProps {
  businessName: string;
  document: string;
  documentType: AccountDocumentType;
  phone: string;
  sellsWhat?: string | null;
  estimatedRevenue?: AccountRevenueRange | null;
}

const MAX_BUSINESS_NAME_LENGTH = 160;
const MAX_SELLS_WHAT_LENGTH = 255;

/**
 * O tenant. Nasce em `pending_onboarding` com os campos de negócio vazios
 * (RF-AUTH-02) e só vira `active` quando o onboarding os preenche — é a
 * invariante (b), que o `CHECK` do banco reforça mas quem garante é `activate()`.
 */
export class Account {
  private readonly id: string;
  private businessName: string | null;
  private document: Document | null;
  private phone: Phone | null;
  private contactEmail: Email | null;
  private sellsWhat: string | null;
  private estimatedRevenue: AccountRevenueRange | null;
  private status: AccountStatus;
  private onboardingCompletedAt: Date | null;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;

  private constructor(props: {
    id: string;
    businessName: string | null;
    document: Document | null;
    phone: Phone | null;
    contactEmail: Email | null;
    sellsWhat: string | null;
    estimatedRevenue: AccountRevenueRange | null;
    status: AccountStatus;
    onboardingCompletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }) {
    this.id = props.id;
    this.businessName = props.businessName;
    this.document = props.document;
    this.phone = props.phone;
    this.contactEmail = props.contactEmail;
    this.sellsWhat = props.sellsWhat;
    this.estimatedRevenue = props.estimatedRevenue;
    this.status = props.status;
    this.onboardingCompletedAt = props.onboardingCompletedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  static create(props: CreateAccountProps): Account {
    return new Account({
      id: props.id,
      businessName: null,
      document: null,
      phone: null,
      contactEmail: Email.createOptional(props.contactEmail),
      sellsWhat: null,
      estimatedRevenue: null,
      status: "pending_onboarding",
      onboardingCompletedAt: null,
      createdAt: props.now,
      updatedAt: props.now,
      deletedAt: null,
    });
  }

  /** Reidrata a entidade a partir de um estado já persistido, sem reaplicar regras de criação. */
  static restore(snapshot: AccountSnapshot): Account {
    return new Account({
      id: snapshot.id,
      businessName: snapshot.businessName,
      document:
        snapshot.document === null || snapshot.documentType === null
          ? null
          : Document.create(snapshot.document, snapshot.documentType),
      phone: snapshot.phone === null ? null : Phone.create(snapshot.phone),
      contactEmail: Email.createOptional(snapshot.contactEmail),
      sellsWhat: snapshot.sellsWhat,
      estimatedRevenue:
        snapshot.estimatedRevenue === null
          ? null
          : toAccountRevenueRange(snapshot.estimatedRevenue),
      status: toAccountStatus(snapshot.status),
      onboardingCompletedAt: snapshot.onboardingCompletedAt,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      deletedAt: snapshot.deletedAt,
    });
  }

  get accountId(): string {
    return this.id;
  }

  get currentStatus(): AccountStatus {
    return this.status;
  }

  get isOnboardingPending(): boolean {
    return this.status === "pending_onboarding";
  }

  get currentDocument(): string | null {
    return this.document?.toString() ?? null;
  }

  /**
   * RF-ONB-01/02: acontece uma única vez, sem estado "parcialmente concluído".
   * Preenche os obrigatórios e ativa — a ativação valida a invariante (b).
   */
  completeOnboarding(props: CompleteOnboardingProps, now: Date): void {
    this.assertIsAvailable();

    if (!this.isOnboardingPending) {
      throw new InvariantViolationError("O onboarding desta conta já foi concluído");
    }

    this.businessName = Account.normalizeBusinessName(props.businessName);
    this.document = Document.create(props.document, props.documentType);
    this.phone = Phone.create(props.phone);
    this.sellsWhat = Account.normalizeSellsWhat(props.sellsWhat);
    this.estimatedRevenue = props.estimatedRevenue ?? null;
    this.onboardingCompletedAt = now;

    this.activate(now);
  }

  /** Invariante (b): conta ativa exige nome do negócio, documento e telefone. */
  activate(now: Date): void {
    if (this.businessName === null || this.document === null || this.phone === null) {
      throw new InvariantViolationError(
        "Uma conta ativa precisa de nome do negócio, CPF/CNPJ e telefone preenchidos",
      );
    }

    this.status = "active";
    this.deletedAt = null;
    this.touch(now);
  }

  renameBusiness(businessName: string, now: Date): void {
    const next = Account.normalizeBusinessName(businessName);

    if (this.businessName === next) {
      return;
    }

    this.businessName = next;
    this.touch(now);
  }

  changeContactEmail(contactEmail: string | null, now: Date): void {
    const next = Email.createOptional(contactEmail);

    if (this.contactEmail?.toString() === next?.toString()) {
      return;
    }

    this.contactEmail = next;
    this.touch(now);
  }

  /** RF-CONF-02: existe só para recusar em voz alta quem tentar por fora da interface. */
  changeDocument(): never {
    throw new DocumentIsImmutableError();
  }

  /** RF-CONF-03: suspende vendas e acesso sem apagar nada. */
  deactivate(now: Date): void {
    if (this.status === "deleted") {
      throw new AccountUnavailableError(this.status);
    }

    this.status = "disabled";
    this.touch(now);
  }

  /** RF-CONF-04: exclusão lógica — o histórico financeiro continua íntegro no banco. */
  markAsDeleted(now: Date): void {
    this.status = "deleted";
    this.deletedAt = now;
    this.touch(now);
  }

  /** Leitura do painel: basta a conta não estar desativada nem excluída. */
  assertCanAccessPanel(): void {
    this.assertIsAvailable();
  }

  /** Escrita no painel: além de disponível, o onboarding precisa estar concluído. */
  assertCanOperate(): void {
    this.assertIsAvailable();

    if (this.isOnboardingPending) {
      throw new OnboardingPendingError();
    }
  }

  /** Venda na página pública: conta suspensa não aceita novas compras (RF-CONF-03). */
  get canSell(): boolean {
    return this.status === "active";
  }

  toSnapshot(): AccountSnapshot {
    return {
      id: this.id,
      businessName: this.businessName,
      document: this.document?.toString() ?? null,
      documentType: this.document?.documentKind ?? null,
      phone: this.phone?.toString() ?? null,
      contactEmail: this.contactEmail?.toString() ?? null,
      sellsWhat: this.sellsWhat,
      estimatedRevenue: this.estimatedRevenue,
      status: this.status,
      onboardingCompletedAt: this.onboardingCompletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  private assertIsAvailable(): void {
    if (this.status === "disabled" || this.status === "deleted") {
      throw new AccountUnavailableError(this.status);
    }
  }

  private static normalizeBusinessName(businessName: string): string {
    const normalized = businessName.trim().replace(/\s+/g, " ");

    if (normalized.length < 1 || normalized.length > MAX_BUSINESS_NAME_LENGTH) {
      throw new InvariantViolationError(
        `O nome do negócio deve ter entre 1 e ${MAX_BUSINESS_NAME_LENGTH} caracteres`,
      );
    }

    return normalized;
  }

  private static normalizeSellsWhat(sellsWhat: string | null | undefined): string | null {
    if (sellsWhat === null || sellsWhat === undefined) {
      return null;
    }

    const normalized = sellsWhat.trim();

    if (normalized === "") {
      return null;
    }

    if (normalized.length > MAX_SELLS_WHAT_LENGTH) {
      throw new InvariantViolationError(
        `"O que vende" deve ter no máximo ${MAX_SELLS_WHAT_LENGTH} caracteres`,
      );
    }

    return normalized;
  }

  private touch(now: Date): void {
    this.updatedAt = now;
  }
}
