/**
 * Schemas zod do contrato. Ponto de entrada separado da raiz de propósito: só
 * `apps/api/src/infra/validation/zod` importa daqui, porque a regra 1 da API
 * proíbe zod fora de `infra/`, e o navegador não precisa carregá-lo.
 */

export * from "./account.schemas";
export * from "./analytics.schemas";
export * from "./auth.schemas";
export * from "./checkout.schemas";
export * from "./gateway.schemas";
export * from "./offer.schemas";
export * from "./order.schemas";
export * from "./product.schemas";
export * from "./public.schemas";
export * from "./shared.schemas";
export * from "./upload.schemas";
