import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export class Money {
  private readonly amountInCents: number;
  private readonly currencyCode: string;

  private constructor(amountInCents: number, currencyCode: string) {
    this.amountInCents = amountInCents;
    this.currencyCode = currencyCode;
  }

  static create(amountInCents: number, currency: string): Money {
    if (!Number.isSafeInteger(amountInCents) || amountInCents < 0) {
      throw new InvariantViolationError(
        "O valor deve ser um número inteiro de centavos não negativo",
      );
    }

    const normalizedCurrency = currency.trim().toUpperCase();

    if (!CURRENCY_PATTERN.test(normalizedCurrency)) {
      throw new InvariantViolationError(`"${currency}" não é um código de moeda ISO 4217 válido`);
    }

    return new Money(amountInCents, normalizedCurrency);
  }

  get cents(): number {
    return this.amountInCents;
  }

  get currency(): string {
    return this.currencyCode;
  }

  isPositive(): boolean {
    return this.amountInCents > 0;
  }

  equals(other: Money): boolean {
    return this.amountInCents === other.amountInCents && this.currencyCode === other.currencyCode;
  }
}
