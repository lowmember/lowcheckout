import type { Controller } from "@/presentation/http/protocols/http";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Descrição de uma rota, sem controller e sem runtime: método, caminho e um
 * nome estável. Parâmetros usam `{param}`. É o contrato que a apresentação
 * publica para quem for expor a API (Lambda, um servidor HTTP, um teste).
 */
export interface RouteDefinition {
  readonly name: string;
  readonly method: HttpMethod;
  readonly path: string;
}

/** Uma definição já ligada ao controller que a atende. */
export interface HttpRoute extends RouteDefinition {
  /**
   * Resolvido sob demanda: com um Lambda por rota, não faz sentido construir
   * os controllers das outras rotas a cada cold start.
   */
  readonly resolveController: () => Controller;
}

/**
 * Porta de registro de rotas. Quem expõe a API registra cada rota aqui e
 * depois resolve pelo nome — sem que a apresentação saiba qual runtime é.
 */
export interface HttpRouteRegistry {
  register(route: HttpRoute): void;
  get(name: string): HttpRoute;
  all(): readonly HttpRoute[];
}
