import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

export const DOCUMENT_KINDS = ["cpf", "cnpj"] as const;

export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

const CPF_LENGTH = 11;
const CNPJ_LENGTH = 14;

/**
 * CPF/CNPJ guardado só com dígitos. Os dígitos verificadores são conferidos
 * aqui (RF-ONB-02): documento sintaticamente possível mas inválido não entra
 * no banco.
 */
export class Document {
  private readonly value: string;
  private readonly kind: DocumentKind;

  private constructor(value: string, kind: DocumentKind) {
    this.value = value;
    this.kind = kind;
  }

  static create(value: string, kind: DocumentKind): Document {
    const digits = value.replace(/\D/g, "");

    if (kind === "cpf") {
      if (!Document.isValidCpf(digits)) {
        throw new InvariantViolationError("CPF inválido");
      }
    } else if (!Document.isValidCnpj(digits)) {
      throw new InvariantViolationError("CNPJ inválido");
    }

    return new Document(digits, kind);
  }

  /** Compradores só informam CPF (RF-PUB-02). */
  static createCpf(value: string): Document {
    return Document.create(value, "cpf");
  }

  toString(): string {
    return this.value;
  }

  get documentKind(): DocumentKind {
    return this.kind;
  }

  equals(other: Document): boolean {
    return this.value === other.value && this.kind === other.kind;
  }

  private static isValidCpf(digits: string): boolean {
    if (digits.length !== CPF_LENGTH || /^(\d)\1+$/.test(digits)) {
      return false;
    }

    return (
      Document.checkDigit(digits, 9, 10) === Number(digits[9]) &&
      Document.checkDigit(digits, 10, 11) === Number(digits[10])
    );
  }

  private static isValidCnpj(digits: string): boolean {
    if (digits.length !== CNPJ_LENGTH || /^(\d)\1+$/.test(digits)) {
      return false;
    }

    const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const secondWeights = [6, ...firstWeights];

    return (
      Document.weightedCheckDigit(digits, firstWeights) === Number(digits[12]) &&
      Document.weightedCheckDigit(digits, secondWeights) === Number(digits[13])
    );
  }

  /** Dígito verificador do CPF: pesos decrescentes a partir de `startWeight`. */
  private static checkDigit(digits: string, length: number, startWeight: number): number {
    let sum = 0;

    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * (startWeight - index);
    }

    const remainder = (sum * 10) % 11;

    return remainder === 10 ? 0 : remainder;
  }

  private static weightedCheckDigit(digits: string, weights: readonly number[]): number {
    let sum = 0;

    for (let index = 0; index < weights.length; index += 1) {
      sum += Number(digits[index]) * (weights[index] ?? 0);
    }

    const remainder = sum % 11;

    return remainder < 2 ? 0 : 11 - remainder;
  }
}
