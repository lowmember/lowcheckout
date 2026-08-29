import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

const MAX_LENGTH = 64;

/** Identificador estável do Google: é a chave de login, não o e-mail (RF-AUTH-01). */
export class GoogleSub {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): GoogleSub {
    const normalized = value.trim();

    if (normalized.length < 1 || normalized.length > MAX_LENGTH) {
      throw new InvariantViolationError("Identificador do Google inválido");
    }

    return new GoogleSub(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: GoogleSub): boolean {
    return this.value === other.value;
  }
}
