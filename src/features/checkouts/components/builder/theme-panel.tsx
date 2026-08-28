import {
  FONT_FAMILY_IDS,
  FONT_FAMILY_LABELS,
  SPACING_LABELS,
  SPACING_PRESETS,
  TYPE_SCALE_LABELS,
  TYPE_SCALES,
} from "@/features/checkouts/lib/checkout-theme";
import type { ThemePatch } from "@/features/checkouts/lib/schema-operations";
import type {
  CheckoutTheme,
  CheckoutThemeColors,
  CheckoutThemeRadii,
  FontFamilyId,
  SpacingPreset,
  TypeScale,
} from "@/features/checkouts/types/checkout-schema";
import { ColorField } from "@/shared/ui/color-field";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { SelectField } from "@/shared/ui/select-field";

const COLOR_FIELDS: { key: keyof CheckoutThemeColors; label: string }[] = [
  { key: "primary", label: "Primária" },
  { key: "primaryText", label: "Texto sobre a primária" },
  { key: "background", label: "Fundo" },
  { key: "surface", label: "Superfície" },
  { key: "text", label: "Texto" },
  { key: "mutedText", label: "Texto secundário" },
  { key: "border", label: "Bordas" },
];

const RADIUS_FIELDS: { key: keyof CheckoutThemeRadii; label: string }[] = [
  { key: "base", label: "Cartões" },
  { key: "button", label: "Botões" },
  { key: "input", label: "Campos" },
];

const FONT_OPTIONS = FONT_FAMILY_IDS.map((id) => ({ value: id, label: FONT_FAMILY_LABELS[id] }));
const SCALE_OPTIONS = TYPE_SCALES.map((scale) => ({
  value: scale,
  label: TYPE_SCALE_LABELS[scale],
}));
const SPACING_OPTIONS = SPACING_PRESETS.map((preset) => ({
  value: preset,
  label: SPACING_LABELS[preset],
}));

interface ThemePanelProps {
  theme: CheckoutTheme;
  onChange: (patch: ThemePatch) => void;
}

/** Customização global: vale para todas as seções de uma vez. */
export function ThemePanel({ theme, onChange }: ThemePanelProps) {
  return (
    <div className="space-y-6 p-4">
      <section className="space-y-4">
        <h3 className="font-medium text-neutral-900 text-sm">Cores</h3>
        {COLOR_FIELDS.map(({ key, label }) => (
          <ColorField
            key={key}
            label={label}
            value={theme.colors[key]}
            onChange={(value) => onChange({ colors: { [key]: value } })}
          />
        ))}
      </section>

      <section className="space-y-4 border-neutral-200 border-t pt-5">
        <h3 className="font-medium text-neutral-900 text-sm">Tipografia</h3>

        <SelectField
          label="Fonte"
          options={FONT_OPTIONS}
          value={theme.typography.fontFamily}
          onChange={(event) =>
            onChange({ typography: { fontFamily: event.target.value as FontFamilyId } })
          }
        />

        <SelectField
          label="Escala dos títulos"
          options={SCALE_OPTIONS}
          value={theme.typography.headingScale}
          onChange={(event) =>
            onChange({ typography: { headingScale: event.target.value as TypeScale } })
          }
        />

        <SelectField
          label="Escala do texto"
          options={SCALE_OPTIONS}
          value={theme.typography.bodyScale}
          onChange={(event) =>
            onChange({ typography: { bodyScale: event.target.value as TypeScale } })
          }
        />
      </section>

      <section className="space-y-4 border-neutral-200 border-t pt-5">
        <h3 className="font-medium text-neutral-900 text-sm">Cantos</h3>

        {RADIUS_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label
              htmlFor={`radius-${key}`}
              className="mb-2 flex items-center justify-between font-medium text-neutral-700 text-sm"
            >
              {label}
              <span className="font-mono text-neutral-400 text-xs">{theme.radii[key]}px</span>
            </label>
            <input
              id={`radius-${key}`}
              type="range"
              min={0}
              max={28}
              value={Math.min(28, theme.radii[key])}
              onChange={(event) => onChange({ radii: { [key]: Number(event.target.value) } })}
              className="w-full accent-neutral-900"
            />
          </div>
        ))}
      </section>

      <section className="space-y-3 border-neutral-200 border-t pt-5">
        <h3 className="font-medium text-neutral-900 text-sm">Espaçamento</h3>
        <SegmentedControl
          className="w-full"
          options={SPACING_OPTIONS}
          value={theme.spacing}
          onChange={(value) => onChange({ spacing: value as SpacingPreset })}
          ariaLabel="Preset de espaçamento"
        />
      </section>
    </div>
  );
}
