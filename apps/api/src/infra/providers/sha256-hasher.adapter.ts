import { createHash } from "node:crypto";

import type { Hasher } from "@/application/shared/ports/hasher";

/** SHA-256 hexadecimal: 64 caracteres, exatamente o `refresh_tokens.token_hash`. */
export class Sha256Hasher implements Hasher {
  hash(value: string): string {
    return createHash("sha256").update(value, "utf8").digest("hex");
  }
}
