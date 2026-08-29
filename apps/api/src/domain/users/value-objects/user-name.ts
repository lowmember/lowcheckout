import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

const MAX_LENGTH = 160;

export class UserName {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): UserName {
    const normalized = value.trim().replace(/\s+/g, " ").slice(0, MAX_LENGTH);

    if (normalized.length < 1) {
      throw new InvariantViolationError("O nome do usuário não pode ser vazio");
    }

    return new UserName(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: UserName): boolean {
    return this.value === other.value;
  }
}
