/**
 * Uma cor só para a série. Série única e barras de medida única não são paleta
 * categórica — verde/âmbar/vermelho aqui seriam cor de status, nunca de série.
 */
export const SERIES_COLOR = "#262626";
export const SERIES_FILL_TOP = "rgba(38, 38, 38, 0.16)";
export const SERIES_FILL_BOTTOM = "rgba(38, 38, 38, 0)";

/** Grid recessivo e eixos discretos: a marca é que carrega o dado. */
export const GRID_COLOR = "#f0f0f0";
export const AXIS_COLOR = "#e5e5e5";

/** Texto sempre em cor neutra, nunca na cor da série. */
export const AXIS_TEXT_COLOR = "#a3a3a3";
export const VALUE_TEXT_COLOR = "#525252";

/** Arredonda o topo do eixo Y para um número legível. */
export function niceCeil(value: number) {
  if (value <= 0) return 1;

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;

  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

/** Escolhe no máximo `max` índices para rotular, sempre incluindo o primeiro e o último. */
export function pickTickIndices(count: number, max = 7) {
  if (count <= 0) return [];
  if (count <= max) return Array.from({ length: count }, (_, index) => index);

  const step = (count - 1) / (max - 1);
  const indices = Array.from({ length: max }, (_, index) => Math.round(index * step));

  return Array.from(new Set(indices));
}
