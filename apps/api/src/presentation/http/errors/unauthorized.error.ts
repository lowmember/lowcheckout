/**
 * Requisição sem identidade resolvida. É erro de apresentação, não de domínio:
 * o domínio nunca soube o que é uma sessão. Vira 401 no `ErrorHandlingController`.
 */
export class UnauthorizedError extends Error {
  readonly code = "unauthorized";

  constructor() {
    super("Requisição não autenticada");
    this.name = "UnauthorizedError";
  }
}
