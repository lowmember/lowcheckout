import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";

import type { Principal } from "@/application/auth/dtos/principal";
import type { AccessTokenIssuer } from "@/application/auth/ports/access-token-issuer";
import { env } from "@/infra/config/env";
import type { Controller, HttpRequest } from "@/presentation/http/protocols/http";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const BEARER_PREFIX = "bearer ";

/**
 * Fronteira entre o API Gateway e a aplicação: converte o evento da AWS no
 * `HttpRequest` da camada de apresentação e a `HttpResponse` de volta.
 * Nenhuma camada acima daqui importa tipos da AWS.
 */
export function adaptLambda(controller: Controller, accessTokenIssuer: AccessTokenIssuer) {
  return async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    let body: unknown;

    try {
      body = parseBody(event);
    } catch {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          message: "O corpo da requisição precisa ser um JSON válido",
          code: "invalid_json",
        }),
      };
    }

    const headers = event.headers ?? {};
    const principal = await resolvePrincipal(headers, accessTokenIssuer);

    const request: HttpRequest = {
      body,
      params: event.pathParameters ?? {},
      query: event.queryStringParameters ?? {},
      headers,
      ...(principal ? { principal } : {}),
    };

    const response = await controller.handle(request);

    return {
      statusCode: response.statusCode,
      headers: { ...JSON_HEADERS, ...response.headers },
      ...(response.body === undefined ? {} : { body: JSON.stringify(response.body) }),
    };
  };
}

/**
 * A identidade vem do access token emitido por `POST /auth/google` (RF-AUTH-03):
 * `Authorization: Bearer <jwt>`. Um token ausente ou inválido não derruba a
 * requisição aqui — ele apenas não produz `principal`, e quem exige identidade
 * é o controller, que responde 401.
 */
async function resolvePrincipal(
  headers: Readonly<Record<string, string | undefined>>,
  accessTokenIssuer: AccessTokenIssuer,
): Promise<Principal | undefined> {
  const bearerToken = readBearerToken(headers.authorization);

  if (bearerToken) {
    // Um Bearer apresentado e recusado encerra a decisão: cair no atalho abaixo
    // trocaria "token expirado" por uma identidade de dev inventada, e o 401
    // que renovaria a sessão viraria erro no primeiro repositório que exigisse
    // o usuário — o `userId` do atalho é o id da *conta*, que não existe em
    // `users`. Quem tenta se identificar e falha recebe 401.
    return (await accessTokenIssuer.verify(bearerToken)) ?? undefined;
  }

  // TODO(RF-AUTH-03): atalho só de desenvolvimento. O fluxo real é o Bearer
  // acima; este header existe para exercitar a API sem passar pelo OAuth do
  // Google, e é bloqueado em produção pelo guarda de stage.
  if (env.stage !== "prod") {
    const devAccountId = headers["x-account-id"];

    if (devAccountId) {
      return { accountId: devAccountId, userId: headers["x-user-id"] ?? devAccountId };
    }
  }

  return undefined;
}

function readBearerToken(authorization: string | undefined): string | undefined {
  if (!authorization?.toLowerCase().startsWith(BEARER_PREFIX)) {
    return undefined;
  }

  const token = authorization.slice(BEARER_PREFIX.length).trim();

  return token === "" ? undefined : token;
}

function parseBody(event: APIGatewayProxyEventV2): unknown {
  if (!event.body) {
    return {};
  }

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  return JSON.parse(raw);
}
