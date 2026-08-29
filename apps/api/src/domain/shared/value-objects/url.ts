import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

const ALLOWED_PROTOCOLS = ["http:", "https:"];

/** URL absoluta http(s). Toda URL que o usuário informa (imagem, banner, entregável) passa por aqui. */
export class Url {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Url {
    const normalized = value.trim();

    let parsed: URL;

    try {
      parsed = new URL(normalized);
    } catch {
      throw new InvariantViolationError(`"${value}" não é uma URL absoluta válida`);
    }

    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      throw new InvariantViolationError(`"${value}" precisa usar o protocolo http ou https`);
    }

    return new Url(parsed.toString());
  }

  /** Aceita o "campo não informado": `null`/`undefined`/vazio viram `null`, sem erro. */
  static createOptional(value: string | null | undefined): Url | null {
    if (value === null || value === undefined || value.trim() === "") {
      return null;
    }

    return Url.create(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Url): boolean {
    return this.value === other.value;
  }
}
