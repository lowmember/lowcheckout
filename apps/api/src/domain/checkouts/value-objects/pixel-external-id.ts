import type { PixelProvider } from "@/domain/checkouts/value-objects/pixel-provider";
import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

const MAX_LENGTH = 120;
/** O pixel do Facebook é um id numérico; o Utmify usa um token alfanumérico. */
const FACEBOOK_PATTERN = /^\d{6,20}$/;
const GENERIC_PATTERN = /^[A-Za-z0-9._-]{4,120}$/;

export class PixelExternalId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string, provider: PixelProvider): PixelExternalId {
    const normalized = value.trim();
    const pattern = provider === "facebook" ? FACEBOOK_PATTERN : GENERIC_PATTERN;

    if (normalized.length > MAX_LENGTH || !pattern.test(normalized)) {
      throw new InvariantViolationError(
        provider === "facebook"
          ? "O ID do pixel do Facebook deve conter apenas dígitos"
          : "O identificador do pixel é inválido",
      );
    }

    return new PixelExternalId(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: PixelExternalId): boolean {
    return this.value === other.value;
  }
}
