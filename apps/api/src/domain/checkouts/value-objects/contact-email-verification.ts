import { Email } from "@/domain/shared/value-objects/email";

/**
 * Pedido de confirmação de e-mail de contato em aberto.
 *
 * Guarda o **hash** do código, nunca o código: quem tem acesso ao banco não pode
 * confirmar um e-mail que não recebeu. O valor em claro só existe no envio.
 */
export class ContactEmailVerification {
  private readonly email: Email;
  private readonly codeHash: string;
  private readonly expiresAt: Date;

  private constructor(email: Email, codeHash: string, expiresAt: Date) {
    this.email = email;
    this.codeHash = codeHash;
    this.expiresAt = expiresAt;
  }

  static create(email: string, codeHash: string, expiresAt: Date): ContactEmailVerification {
    return new ContactEmailVerification(Email.create(email), codeHash, expiresAt);
  }

  get pendingEmail(): string {
    return this.email.toString();
  }

  /** Só a persistência precisa disto: o código em claro nunca é guardado. */
  get hashedCode(): string {
    return this.codeHash;
  }

  get expiration(): Date {
    return this.expiresAt;
  }

  isExpired(now: Date): boolean {
    return this.expiresAt.getTime() <= now.getTime();
  }

  matches(codeHash: string): boolean {
    return this.codeHash === codeHash;
  }
}
