/** Origem de uma revisão de customização: builder manual, "Importar JSON" ou geração por IA. */
export const CUSTOMIZATION_SOURCES = ["builder", "json_import", "ai"] as const;

export type CustomizationSource = (typeof CUSTOMIZATION_SOURCES)[number];
