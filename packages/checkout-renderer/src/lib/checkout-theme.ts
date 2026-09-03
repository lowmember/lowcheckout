import type { CSSProperties } from "react";

import type {
  CheckoutTheme,
  FontFamilyId,
  SpacingPreset,
  TypeScale,
} from "../types/checkout-schema";
import { readInteger, readOption, readString } from "./schema-normalizers";

export const FONT_FAMILY_IDS: FontFamilyId[] = ["sans", "grotesk", "serif", "mono"];
export const TYPE_SCALES: TypeScale[] = ["sm", "md", "lg"];
export const SPACING_PRESETS: SpacingPreset[] = ["compact", "default", "spacious"];

export const FONT_STACKS: Record<FontFamilyId, string> = {
  sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
  grotesk: '"Space Grotesk", "Inter", ui-sans-serif, system-ui, sans-serif',
  serif: 'Georgia, "Iowan Old Style", "Times New Roman", serif',
  mono: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace',
};

export const FONT_FAMILY_LABELS: Record<FontFamilyId, string> = {
  sans: "Sans",
  grotesk: "Grotesk",
  serif: "Serifada",
  mono: "Monoespaçada",
};

export const TYPE_SCALE_LABELS: Record<TypeScale, string> = {
  sm: "Compacta",
  md: "Padrão",
  lg: "Ampliada",
};

export const SPACING_LABELS: Record<SpacingPreset, string> = {
  compact: "Compacto",
  default: "Padrão",
  spacious: "Espaçoso",
};

const HEADING_SCALE: Record<TypeScale, number> = { sm: 0.9, md: 1, lg: 1.14 };
const BODY_SCALE: Record<TypeScale, number> = { sm: 0.92, md: 1, lg: 1.08 };
const SPACING_SCALE: Record<SpacingPreset, number> = { compact: 0.72, default: 1, spacious: 1.4 };

export const DEFAULT_THEME: CheckoutTheme = {
  colors: {
    primary: "#2f39d4",
    primaryText: "#ffffff",
    background: "#ededed",
    surface: "#ffffff",
    text: "#1f2024",
    mutedText: "#71717a",
    border: "#e4e4e7",
  },
  typography: {
    fontFamily: "sans",
    headingScale: "md",
    bodyScale: "md",
  },
  radii: {
    base: 10,
    button: 8,
    input: 8,
  },
  spacing: "default",
};

export function isHexColor(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

export function normalizeTheme(raw: unknown): CheckoutTheme {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return structuredClone(DEFAULT_THEME);
  }

  const source = raw as Record<string, unknown>;
  const colors = (source.colors ?? {}) as Record<string, unknown>;
  const typography = (source.typography ?? {}) as Record<string, unknown>;
  const radii = (source.radii ?? {}) as Record<string, unknown>;

  function color(key: keyof CheckoutTheme["colors"]) {
    const value = readString(colors, key, DEFAULT_THEME.colors[key]);
    return isHexColor(value) ? value : DEFAULT_THEME.colors[key];
  }

  return {
    colors: {
      primary: color("primary"),
      primaryText: color("primaryText"),
      background: color("background"),
      surface: color("surface"),
      text: color("text"),
      mutedText: color("mutedText"),
      border: color("border"),
    },
    typography: {
      fontFamily: readOption(typography, "fontFamily", FONT_FAMILY_IDS, "sans"),
      headingScale: readOption(typography, "headingScale", TYPE_SCALES, "md"),
      bodyScale: readOption(typography, "bodyScale", TYPE_SCALES, "md"),
    },
    radii: {
      base: readInteger(radii, "base", DEFAULT_THEME.radii.base, 0, 40),
      button: readInteger(radii, "button", DEFAULT_THEME.radii.button, 0, 40),
      input: readInteger(radii, "input", DEFAULT_THEME.radii.input, 0, 40),
    },
    spacing: readOption(source, "spacing", SPACING_PRESETS, "default"),
  };
}

/**
 * Tema → custom properties. Toda a árvore do renderer lê apenas essas
 * variáveis, então preview e página pública não têm como divergir.
 */
export function buildThemeVariables(theme: CheckoutTheme): CSSProperties {
  return {
    "--lc-primary": theme.colors.primary,
    "--lc-primary-text": theme.colors.primaryText,
    "--lc-background": theme.colors.background,
    "--lc-surface": theme.colors.surface,
    "--lc-text": theme.colors.text,
    "--lc-muted": theme.colors.mutedText,
    "--lc-border": theme.colors.border,
    "--lc-radius": `${theme.radii.base}px`,
    "--lc-radius-button": `${theme.radii.button}px`,
    "--lc-radius-input": `${theme.radii.input}px`,
    "--lc-font": FONT_STACKS[theme.typography.fontFamily],
    "--lc-heading-scale": HEADING_SCALE[theme.typography.headingScale],
    "--lc-body-scale": BODY_SCALE[theme.typography.bodyScale],
    "--lc-space": SPACING_SCALE[theme.spacing],
  } as CSSProperties;
}

/** Tamanho de título proporcional à escala de headings do tema. */
export function headingSize(rem: number) {
  return `calc(${rem}rem * var(--lc-heading-scale))`;
}

/** Tamanho de corpo proporcional à escala de texto do tema. */
export function bodySize(rem: number) {
  return `calc(${rem}rem * var(--lc-body-scale))`;
}

/** Espaçamento vertical proporcional ao preset do tema. */
export function spaceSize(rem: number) {
  return `calc(${rem}rem * var(--lc-space))`;
}
