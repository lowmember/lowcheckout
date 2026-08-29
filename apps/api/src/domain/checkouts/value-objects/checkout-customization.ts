import { InvariantViolationError } from "@/domain/shared/errors/domain.error";

/**
 * Catálogo fixo de propriedades customizáveis (S9). O builder manual
 * (RF-CHK-07) e o "Importar JSON" (RF-CHK-08) são duas interfaces para
 * **este** conjunto — não existe propriedade livre.
 */
export const CHECKOUT_CUSTOMIZATION_COLOR_KEYS = [
  "primaryColor",
  "backgroundColor",
  "surfaceColor",
  "textColor",
  "mutedTextColor",
  "buttonColor",
  "buttonTextColor",
] as const;

export const CHECKOUT_CUSTOMIZATION_TEXT_KEYS = [
  "headline",
  "subheadline",
  "ctaLabel",
  "footerText",
] as const;

export const CHECKOUT_CUSTOMIZATION_FLAG_KEYS = ["showProductImage", "showSecureBadge"] as const;

export type CheckoutCustomizationColorKey = (typeof CHECKOUT_CUSTOMIZATION_COLOR_KEYS)[number];
export type CheckoutCustomizationTextKey = (typeof CHECKOUT_CUSTOMIZATION_TEXT_KEYS)[number];
export type CheckoutCustomizationFlagKey = (typeof CHECKOUT_CUSTOMIZATION_FLAG_KEYS)[number];

export type CheckoutCustomizationKey =
  | CheckoutCustomizationColorKey
  | CheckoutCustomizationTextKey
  | CheckoutCustomizationFlagKey;

/** Forma persistida e trafegada: sempre completa, nunca parcial. */
export type CheckoutCustomizationProps = Record<CheckoutCustomizationColorKey, string> &
  Record<CheckoutCustomizationTextKey, string | null> &
  Record<CheckoutCustomizationFlagKey, boolean>;

/** Tema padrão aplicado quando nada foi salvo (RF-CHK-07). */
const DEFAULTS: CheckoutCustomizationProps = {
  primaryColor: "#2563eb",
  backgroundColor: "#f8fafc",
  surfaceColor: "#ffffff",
  textColor: "#0f172a",
  mutedTextColor: "#64748b",
  buttonColor: "#16a34a",
  buttonTextColor: "#ffffff",
  headline: null,
  subheadline: null,
  ctaLabel: "Comprar agora",
  footerText: null,
  showProductImage: true,
  showSecureBadge: true,
};

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/;
const MAX_TEXT_LENGTH = 200;

const ALL_KEYS: readonly string[] = [
  ...CHECKOUT_CUSTOMIZATION_COLOR_KEYS,
  ...CHECKOUT_CUSTOMIZATION_TEXT_KEYS,
  ...CHECKOUT_CUSTOMIZATION_FLAG_KEYS,
];

export class CheckoutCustomization {
  private readonly props: CheckoutCustomizationProps;

  private constructor(props: CheckoutCustomizationProps) {
    this.props = props;
  }

  static default(): CheckoutCustomization {
    return new CheckoutCustomization({ ...DEFAULTS });
  }

  /**
   * Entrada do usuário (builder ou JSON importado). Substituição **total**: o
   * que não vier volta ao padrão. Propriedade fora do catálogo é recusada antes
   * de qualquer alteração de estado (RF-CHK-08).
   */
  static create(input: Record<string, unknown>): CheckoutCustomization {
    const unknownKeys = Object.keys(input).filter((key) => !ALL_KEYS.includes(key));

    if (unknownKeys.length > 0) {
      throw new InvariantViolationError(
        `Propriedade de customização desconhecida: ${unknownKeys.join(", ")}`,
      );
    }

    const props = { ...DEFAULTS };

    for (const key of CHECKOUT_CUSTOMIZATION_COLOR_KEYS) {
      const value = input[key];

      if (value !== undefined && value !== null) {
        props[key] = CheckoutCustomization.toColor(key, value);
      }
    }

    for (const key of CHECKOUT_CUSTOMIZATION_TEXT_KEYS) {
      if (key in input) {
        props[key] = CheckoutCustomization.toText(key, input[key]);
      }
    }

    for (const key of CHECKOUT_CUSTOMIZATION_FLAG_KEYS) {
      const value = input[key];

      if (value !== undefined && value !== null) {
        props[key] = CheckoutCustomization.toFlag(key, value);
      }
    }

    return new CheckoutCustomization(props);
  }

  /**
   * Reidratação: tolerante de propósito. Linhas gravadas antes de o catálogo
   * crescer (ou o `'{}'` default da coluna) precisam voltar como tema válido —
   * a rigidez fica na escrita, que é onde o usuário recebe o erro.
   */
  static restore(stored: Record<string, unknown> | null | undefined): CheckoutCustomization {
    if (!stored) {
      return CheckoutCustomization.default();
    }

    const props = { ...DEFAULTS };

    for (const key of CHECKOUT_CUSTOMIZATION_COLOR_KEYS) {
      const value = stored[key];

      if (typeof value === "string" && HEX_COLOR_PATTERN.test(value.toLowerCase())) {
        props[key] = value.toLowerCase();
      }
    }

    for (const key of CHECKOUT_CUSTOMIZATION_TEXT_KEYS) {
      const value = stored[key];

      if (typeof value === "string") {
        props[key] = value;
      } else if (value === null) {
        props[key] = null;
      }
    }

    for (const key of CHECKOUT_CUSTOMIZATION_FLAG_KEYS) {
      const value = stored[key];

      if (typeof value === "boolean") {
        props[key] = value;
      }
    }

    return new CheckoutCustomization(props);
  }

  toProps(): CheckoutCustomizationProps {
    return { ...this.props };
  }

  private static toColor(key: string, value: unknown): string {
    if (typeof value !== "string" || !HEX_COLOR_PATTERN.test(value.trim().toLowerCase())) {
      throw new InvariantViolationError(`"${key}" deve ser uma cor hexadecimal no formato #rrggbb`);
    }

    return value.trim().toLowerCase();
  }

  private static toText(key: string, value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value !== "string") {
      throw new InvariantViolationError(`"${key}" deve ser um texto`);
    }

    const normalized = value.trim();

    if (normalized.length > MAX_TEXT_LENGTH) {
      throw new InvariantViolationError(
        `"${key}" deve ter no máximo ${MAX_TEXT_LENGTH} caracteres`,
      );
    }

    return normalized === "" ? null : normalized;
  }

  private static toFlag(key: string, value: unknown): boolean {
    if (typeof value !== "boolean") {
      throw new InvariantViolationError(`"${key}" deve ser verdadeiro ou falso`);
    }

    return value;
  }
}
