import type { HttpRequest } from "@/presentation/http/protocols/http";

/**
 * Um PATCH junta o identificador do caminho com os campos do corpo antes de
 * validar. O caminho vence: nada no corpo pode reescrever o recurso alvo.
 */
export function mergeBodyAndParams(request: HttpRequest): Record<string, unknown> {
  const body =
    request.body !== null && typeof request.body === "object"
      ? (request.body as Record<string, unknown>)
      : {};

  return { ...body, ...request.params };
}
