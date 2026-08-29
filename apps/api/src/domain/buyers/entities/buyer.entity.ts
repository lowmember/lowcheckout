import { InvariantViolationError } from "@/domain/shared/errors/domain.error";
import { Document } from "@/domain/shared/value-objects/document";
import { Email } from "@/domain/shared/value-objects/email";

/** Representação primitiva da entidade — é o que atravessa a fronteira do domínio. */
export interface BuyerSnapshot {
  id: string;
  accountId: string;
  name: string;
  email: string;
  document: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBuyerProps {
  id: string;
  accountId: string;
  name: string;
  email: string;
  document: string;
  now: Date;
}

const MAX_NAME_LENGTH = 160;

/**
 * O comprador não tem conta, login nem painel: este registro existe para dar ao
 * lojista o histórico de quem comprou dele. Escopo por conta de propósito — o
 * mesmo CPF comprando de dois lojistas são dois registros. Dado pessoal (LGPD).
 */
export class Buyer {
  private readonly id: string;
  private readonly accountId: string;
  private name: string;
  private readonly email: Email;
  private document: Document;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id: string;
    accountId: string;
    name: string;
    email: Email;
    document: Document;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.accountId = props.accountId;
    this.name = props.name;
    this.email = props.email;
    this.document = props.document;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CreateBuyerProps): Buyer {
    return new Buyer({
      id: props.id,
      accountId: props.accountId,
      name: Buyer.normalizeName(props.name),
      email: Email.create(props.email),
      document: Document.createCpf(props.document),
      createdAt: props.now,
      updatedAt: props.now,
    });
  }

  /** Reidrata a entidade a partir de um estado já persistido, sem reaplicar regras de criação. */
  static restore(snapshot: BuyerSnapshot): Buyer {
    return new Buyer({
      id: snapshot.id,
      accountId: snapshot.accountId,
      name: snapshot.name,
      email: Email.create(snapshot.email),
      document: Document.createCpf(snapshot.document),
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  get buyerId(): string {
    return this.id;
  }

  get currentName(): string {
    return this.name;
  }

  get currentEmail(): string {
    return this.email.toString();
  }

  get currentDocument(): string {
    return this.document.toString();
  }

  /** Compra seguinte com o mesmo e-mail: os dados mais recentes prevalecem. */
  refresh(name: string, document: string, now: Date): void {
    const nextName = Buyer.normalizeName(name);
    const nextDocument = Document.createCpf(document);

    if (this.name === nextName && this.document.equals(nextDocument)) {
      return;
    }

    this.name = nextName;
    this.document = nextDocument;
    this.updatedAt = now;
  }

  toSnapshot(): BuyerSnapshot {
    return {
      id: this.id,
      accountId: this.accountId,
      name: this.name,
      email: this.email.toString(),
      document: this.document.toString(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private static normalizeName(name: string): string {
    const normalized = name.trim().replace(/\s+/g, " ");

    if (normalized.length < 1 || normalized.length > MAX_NAME_LENGTH) {
      throw new InvariantViolationError(`O nome deve ter entre 1 e ${MAX_NAME_LENGTH} caracteres`);
    }

    return normalized;
  }
}
