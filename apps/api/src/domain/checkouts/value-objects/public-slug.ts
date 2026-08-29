import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_LENGTH = 160;
const MAX_BASE_LENGTH = 120;
const TOKEN_LENGTH = 8;

/**
 * A URL pública de um vínculo checkout↔oferta (`checkout_offers.public_slug`).
 * É única globalmente e opaca o bastante para não ser adivinhada: o nome de
 * exibição vira prefixo legível e um token aleatório garante a unicidade — o
 * blueprint não promete reuso do slug após desvincular (RF-CHK-05).
 */
export class PublicSlug {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): PublicSlug {
    if (value.length > MAX_LENGTH || !SLUG_PATTERN.test(value)) {
      throw new InvariantViolationError(`"${value}" não é uma URL pública válida`);
    }

    return new PublicSlug(value);
  }

  /** `token` vem do `IdGenerator`; a aplicação garante a unicidade contra o banco. */
  static generate(displayName: string, token: string): PublicSlug {
    const base = PublicSlug.slugify(displayName).slice(0, MAX_BASE_LENGTH).replace(/-$/, "");
    const suffix = PublicSlug.slugify(token).replace(/-/g, "").slice(0, TOKEN_LENGTH);

    if (suffix.length === 0) {
      throw new InvariantViolationError("Não foi possível gerar a URL pública do vínculo");
    }

    return new PublicSlug(base === "" ? suffix : `${base}-${suffix}`);
  }

  toString(): string {
    return this.value;
  }

  private static slugify(value: string): string {
    return value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
}
