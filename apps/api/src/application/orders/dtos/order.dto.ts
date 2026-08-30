/**
 * Reexporta o contrato: a forma deste DTO é a mesma que `apps/web` consome, e
 * existe uma definição só, em `@lowcheckout/contracts`. O sufixo `Dto` é a
 * convenção de papel da API (CLAUDE.md) e por isso o alias fica aqui.
 */

export type { Order as OrderDto } from "@lowcheckout/contracts";
