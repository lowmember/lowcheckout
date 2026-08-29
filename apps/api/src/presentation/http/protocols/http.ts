import type { Principal } from "@/application/auth/dtos/principal";

export type { Principal };

/** Abstração de HTTP da aplicação — não depende de API Gateway, Express ou qualquer runtime. */
export interface HttpRequest<TBody = unknown> {
  body: TBody;
  params: Readonly<Record<string, string | undefined>>;
  query: Readonly<Record<string, string | undefined>>;
  headers: Readonly<Record<string, string | undefined>>;
  /**
   * Quem está pedindo, já resolvido pela borda. Opcional porque as rotas
   * públicas (módulo PUB) e os webhooks do gateway não têm sessão.
   */
  principal?: Principal;
}

export interface HttpResponse<TBody = unknown> {
  statusCode: number;
  body?: TBody;
  headers?: Record<string, string>;
}

export interface Controller {
  handle(request: HttpRequest): Promise<HttpResponse>;
}
