/**
 * Porta de validação. Quem valida (zod, valibot, código à mão) é decisão da infra;
 * o controller só conhece esta interface.
 */
export interface Validator<TOutput> {
  validate(input: unknown): TOutput;
}
