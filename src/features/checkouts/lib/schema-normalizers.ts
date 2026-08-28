import { createLocalId } from "@/features/checkouts/lib/create-id";
import type { ListItem } from "@/features/checkouts/types/checkout-schema";

/**
 * Leitores tolerantes: o JSONB pode vir de uma versão anterior do schema, de um
 * import manual ou da API. Nada quebra a tela — o que não bate com o catálogo
 * cai no padrão. A validação que **recusa** vive em `checkout-schema.ts`.
 */
export function readString(raw: Record<string, unknown>, key: string, fallback: string) {
  const value = raw[key];
  return typeof value === "string" ? value : fallback;
}

export function readBoolean(raw: Record<string, unknown>, key: string, fallback: boolean) {
  const value = raw[key];
  return typeof value === "boolean" ? value : fallback;
}

export function readInteger(
  raw: Record<string, unknown>,
  key: string,
  fallback: number,
  min: number,
  max: number,
) {
  const value = raw[key];
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;

  return Math.min(max, Math.max(min, Math.round(value)));
}

export function readOption<TOption extends string>(
  raw: Record<string, unknown>,
  key: string,
  options: readonly TOption[],
  fallback: TOption,
) {
  const value = raw[key];
  return options.includes(value as TOption) ? (value as TOption) : fallback;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Props e itens são `interface`, e interface não ganha index signature
 * implícita. Esta é a única ponte entre os tipos fortes do schema e a leitura
 * por chave que o painel de propriedades genérico precisa fazer.
 */
export function toPropsRecord(value: object): Record<string, unknown> {
  return value as Record<string, unknown>;
}

export function readList<TItem extends ListItem>(
  raw: Record<string, unknown>,
  key: string,
  normalizeItem: (item: Record<string, unknown>) => TItem,
  fallback: TItem[],
  maxItems: number,
) {
  const value = raw[key];
  if (!Array.isArray(value)) return fallback;

  return value
    .filter(isRecord)
    .slice(0, maxItems)
    .map((item) => normalizeItem(item));
}

export function readItemId(raw: Record<string, unknown>, prefix: string) {
  const value = raw.id;
  return typeof value === "string" && value.length > 0 ? value : createLocalId(prefix);
}
