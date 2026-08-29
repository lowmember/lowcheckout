import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import type { Encrypter } from "@/application/shared/ports/encrypter";
import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

const ALGORITHM = "aes-256-gcm";
const KEY_BYTES = 32;
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;
const PREFIX = "v1";

/**
 * AES-256-GCM com IV aleatório por mensagem. O texto cifrado carrega tudo o que
 * é preciso para decifrar — `v1.<iv>.<tag>.<payload>`, tudo em base64url —, e o
 * prefixo de versão deixa a porta aberta para rotacionar algoritmo sem
 * adivinhar o formato do que já está gravado.
 */
export class AesGcmEncrypter implements Encrypter {
  private readonly key: Buffer;

  constructor(key: string) {
    this.key = AesGcmEncrypter.toKey(key);
  }

  encrypt(plainText: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const payload = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);

    return [
      PREFIX,
      iv.toString("base64url"),
      cipher.getAuthTag().toString("base64url"),
      payload.toString("base64url"),
    ].join(".");
  }

  decrypt(cipherText: string): string {
    const [prefix, rawIv, rawTag, rawPayload] = cipherText.split(".");

    if (prefix !== PREFIX || !rawIv || !rawTag || !rawPayload) {
      throw new InvariantViolationError("Texto cifrado em formato desconhecido");
    }

    const iv = Buffer.from(rawIv, "base64url");
    const authTag = Buffer.from(rawTag, "base64url");

    if (iv.length !== IV_BYTES || authTag.length !== AUTH_TAG_BYTES) {
      throw new InvariantViolationError("Texto cifrado em formato desconhecido");
    }

    const decipher = createDecipheriv(ALGORITHM, this.key, iv);

    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(Buffer.from(rawPayload, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  }

  /** Aceita a chave em hex (64 caracteres) ou base64/base64url de 32 bytes. */
  private static toKey(key: string): Buffer {
    const candidate = /^[0-9a-fA-F]{64}$/.test(key)
      ? Buffer.from(key, "hex")
      : Buffer.from(key, "base64url");

    if (candidate.length !== KEY_BYTES) {
      throw new Error(
        `ENCRYPTION_KEY precisa ter ${KEY_BYTES} bytes (64 caracteres hex ou base64 equivalente)`,
      );
    }

    return candidate;
  }
}
