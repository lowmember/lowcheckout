import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
const MAX_LENGTH = 255;

export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();

    if (normalized.length > MAX_LENGTH || !EMAIL_PATTERN.test(normalized)) {
      throw new InvariantViolationError(`"${value}" não é um e-mail válido`);
    }

    return new Email(normalized);
  }

  static createOptional(value: string | null | undefined): Email | null {
    if (value === null || value === undefined || value.trim() === "") {
      return null;
    }

    return Email.create(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
