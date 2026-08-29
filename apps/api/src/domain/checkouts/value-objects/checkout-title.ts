import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

const MIN_LENGTH = 1;
const MAX_LENGTH = 120;

/**
 * Texto curto de identidade do checkout. Usado nos dois títulos: o interno
 * (só no painel) e o de exibição (título da página pública e footer) — RF-CHK-01.
 */
export class CheckoutTitle {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): CheckoutTitle {
    const normalized = value.trim().replace(/\s+/g, " ");

    if (normalized.length < MIN_LENGTH || normalized.length > MAX_LENGTH) {
      throw new InvariantViolationError(
        `O título do checkout deve ter entre ${MIN_LENGTH} e ${MAX_LENGTH} caracteres`,
      );
    }

    return new CheckoutTitle(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: CheckoutTitle): boolean {
    return this.value === other.value;
  }
}
