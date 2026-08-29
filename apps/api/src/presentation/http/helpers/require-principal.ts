import { UnauthorizedError } from "@/presentation/http/errors/unauthorized.error";
import type { HttpRequest, Principal } from "@/presentation/http/protocols/http";

/**
 * Extrai o `principal` ou interrompe com 401. Os controllers chamam isto em vez
 * de tratar o caso ausente: quem traduz o erro em status é o decorator.
 */
export function requirePrincipal(request: HttpRequest): Principal {
  if (!request.principal) {
    throw new UnauthorizedError();
  }

  return request.principal;
}
