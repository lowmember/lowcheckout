import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

const MIN_DIGITS = 10;
const MAX_DIGITS = 15;

/**
 * Telefone guardado só com dígitos (E.164 sem formatação). Números brasileiros
 * digitados sem DDI ganham o `55` na normalização, para que a coluna nunca
 * misture "11999998888" com "5511999998888".
 */
export class Phone {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Phone {
    const digits = value.replace(/\D/g, "");
    const normalized = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;

    if (normalized.length < MIN_DIGITS || normalized.length > MAX_DIGITS) {
      throw new InvariantViolationError(`"${value}" não é um telefone válido`);
    }

    return new Phone(normalized);
  }

  static createOptional(value: string | null | undefined): Phone | null {
    if (value === null || value === undefined || value.trim() === "") {
      return null;
    }

    return Phone.create(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }
}
