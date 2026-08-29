import { routeDefinitions } from "@/presentation/http/routes/http-routes";

/**
 * Traduz as rotas da apresentação em funções do Serverless. Consumido pelo
 * `serverless.ts`, de modo que método e caminho existam em um lugar só.
 * Convenção: o arquivo do handler é o nome da rota em kebab-case.
 */
export const lambdaFunctions = Object.fromEntries(
  routeDefinitions.map((route) => [
    route.name,
    {
      handler: `src/infra/http/lambda/handlers/${toKebabCase(route.name)}.handler`,
      events: [{ httpApi: { method: route.method, path: route.path } }],
    },
  ]),
);

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
