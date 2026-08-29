import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

const MIN_LENGTH = 1;
const MAX_LENGTH = 120;

/** Nome de uso interno: identifica a variação no painel e nunca aparece ao comprador (RF-OFER-01). */
export class OfferName {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): OfferName {
    const normalized = value.trim().replace(/\s+/g, " ");

    if (normalized.length < MIN_LENGTH || normalized.length > MAX_LENGTH) {
      throw new InvariantViolationError(
        `O nome da oferta deve ter entre ${MIN_LENGTH} e ${MAX_LENGTH} caracteres`,
      );
    }

    return new OfferName(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: OfferName): boolean {
    return this.value === other.value;
  }
}
