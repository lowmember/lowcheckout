import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

/**
 * Alfabeto do código curto: 31 símbolos, sem `0`, `1`, `i`, `l` e `o`.
 *
 * A URL do checkout é lida em voz alta, digitada de um print e passada por
 * WhatsApp — os pares que se confundem nessas situações simplesmente não
 * existem aqui. O preço é 5 símbolos a menos de entropia, que o comprimento
 * compensa de sobra.
 */
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const CODE_LENGTH = 8;
const SEED_CHARS_PER_SYMBOL = 2;

/**
 * Formato aceito na leitura. É mais largo que o que `generate` produz de
 * propósito: vínculos criados antes do código curto guardam o slug legível
 * (`meu-produto-a1b2c3d4`) e precisam continuar resolvendo.
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_LENGTH = 160;

/**
 * A URL pública de um vínculo checkout↔oferta (`checkout_offers.public_slug`).
 *
 * É única globalmente e opaca: um código curto de 8 símbolos, servido na raiz
 * do domínio do checkout (`lowchk.click/a7k3mp2q`). Curto porque é a URL que o
 * lojista divulga; opaco porque enumerar checkouts alheios não pode ser uma
 * questão de incrementar um número.
 *
 * 31^8 ≈ 8,5 × 10¹¹ combinações. A garantia de unicidade não é essa conta e
 * sim o `unique(public_slug)` no banco — a aplicação só evita o erro previsível
 * tentando de novo.
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

  /**
   * `seed` é um segredo opaco de alta entropia (`SecretGenerator`), e não um
   * texto do usuário: o slug não deriva mais do nome de exibição.
   *
   * Cada símbolo consome **dois** caracteres do seed. Um só não bastaria: o
   * seed vem em base64url, e os 64 códigos ASCII possíveis, reduzidos por
   * `% 31`, alcançam apenas 28 símbolos do alfabeto e com frequências que
   * variam quase 3x entre si. Combinar dois caracteres torna o valor reduzido
   * grande o bastante para cobrir os 31 símbolos com desvio de ~4%.
   */
  static generate(seed: string): PublicSlug {
    if (seed.length < CODE_LENGTH * SEED_CHARS_PER_SYMBOL) {
      throw new InvariantViolationError("Não foi possível gerar a URL pública do vínculo");
    }

    let code = "";

    for (let index = 0; index < CODE_LENGTH; index += 1) {
      const offset = index * SEED_CHARS_PER_SYMBOL;
      const pair = seed.charCodeAt(offset) * 128 + seed.charCodeAt(offset + 1);

      code += ALPHABET[pair % ALPHABET.length];
    }

    return new PublicSlug(code);
  }

  toString(): string {
    return this.value;
  }
}
