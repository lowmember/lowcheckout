/**
 * Contrato HTTP entre `apps/api` e `apps/web`.
 *
 * Este ponto de entrada é **livre de dependências** — nem zod. Ver o README:
 * é o que permite `application/` da API consumir os tipos sem violar a regra de
 * camadas, e o que mantém o bundle do navegador enxuto.
 *
 * Os schemas de validação ficam em `@lowcheckout/contracts/schemas`.
 */

export * from "./accounts";
export * from "./analytics";
export * from "./auth";
export * from "./checkouts";
export * from "./envelope";
export * from "./gateways";
export * from "./notifications";
export * from "./offers";
export * from "./orders";
export * from "./products";
export * from "./public";
export * from "./uploads";
export * from "./users";
