import { randomInt } from "node:crypto";

import type { VerificationCodeGenerator } from "@/application/shared/ports/verification-code-generator";

const CODE_DIGITS = 6;

/** Seis dígitos sorteados sem viés — curto para digitar, aleatório o bastante para 15 minutos. */
export class CryptoVerificationCodeGenerator implements VerificationCodeGenerator {
  generate(): string {
    return String(randomInt(0, 10 ** CODE_DIGITS)).padStart(CODE_DIGITS, "0");
  }
}
