/** Gera o código numérico curto que a pessoa digita de volta (confirmação de e-mail). */
export interface VerificationCodeGenerator {
  generate(): string;
}
