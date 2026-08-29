import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

const MIN_LENGTH = 1;
const MAX_LENGTH = 120;

export class ProductName {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): ProductName {
    const normalized = value.trim().replace(/\s+/g, " ");

    if (normalized.length < MIN_LENGTH || normalized.length > MAX_LENGTH) {
      throw new InvariantViolationError(
        `O nome do produto deve ter entre ${MIN_LENGTH} e ${MAX_LENGTH} caracteres`,
      );
    }

    return new ProductName(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: ProductName): boolean {
    return this.value === other.value;
  }
}
