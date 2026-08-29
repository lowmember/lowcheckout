import { getContainer } from "@/infra/di/container";
import { getHttpRouteRegistry } from "@/infra/di/factories/http-route-registry.factory";
import { adaptLambda } from "@/infra/http/lambda/lambda.adapter";
import type { RouteName } from "@/presentation/http/routes/http-routes";

/**
 * Registra um Lambda como implementação de uma rota da camada de apresentação:
 * resolve a rota pelo nome no registry e adapta o controller ao evento da AWS.
 * O handler exportado por cada função é só uma chamada disto.
 */
export function adaptLambdaRoute(name: RouteName) {
  return adaptLambda(
    getHttpRouteRegistry().get(name).resolveController(),
    getContainer().accessTokenIssuer,
  );
}
