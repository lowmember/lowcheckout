import { z } from "zod";

/**
 * Peças reaproveitadas pelos schemas de entrada. Aqui só mora *formato*:
 * regra de negócio é responsabilidade do domínio.
 */
export const idSchema = z.uuid({ error: "Informe um identificador válido" });

export const urlSchema = z.url({ error: "Informe uma URL absoluta válida" });

/** Campo de URL opcional: ausente = não mexe; `null` = limpa. */
export const optionalUrlSchema = urlSchema.nullable().optional();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
});
