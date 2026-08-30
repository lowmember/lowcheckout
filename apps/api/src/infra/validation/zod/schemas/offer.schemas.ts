/**
 * Reexporta o contrato. Os schemas moram em `@lowcheckout/contracts/schemas`
 * para que `apps/web` valide contra a mesma definição — este arquivo preserva o
 * ponto de importação da infra, a única camada autorizada a conhecer zod
 * (regra 1 do CLAUDE.md).
 */

export {
  createOfferSchema,
  getOfferSchema,
  listOffersSchema,
  updateOfferSchema,
} from "@lowcheckout/contracts/schemas";
