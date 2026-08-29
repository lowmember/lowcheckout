import { randomBytes } from "node:crypto";

import type { SecretGenerator } from "@/application/shared/ports/secret-generator";

const SECRET_BYTES = 48;

/** 48 bytes aleatórios em base64url: opaco, sem padding e seguro em URL. */
export class CryptoSecretGenerator implements SecretGenerator {
  generate(): string {
    return randomBytes(SECRET_BYTES).toString("base64url");
  }
}
