import type { LeafPropertyField } from "@/features/checkouts/lib/section-registry";
import { cn } from "@/shared/lib/cn";
import { SelectField } from "@/shared/ui/select-field";
import { TextField } from "@/shared/ui/text-field";
import { TextareaField } from "@/shared/ui/textarea-field";

interface PropertyControlProps {
  field: LeafPropertyField;
  value: unknown;
  onChange: (value: unknown) => void;
}

/**
 * Renderiza um controle a partir do descritor do registry. Nenhuma seção é
 * citada por nome aqui: seção nova aparece no painel sem tocar nesta tela.
 */
export function PropertyControl({ field, value, onChange }: PropertyControlProps) {
  switch (field.kind) {
    case "text":
    case "image":
      return (
        <TextField
          label={field.label}
          hint={field.hint}
          value={typeof value === "string" ? value : ""}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          inputMode={field.kind === "image" ? "url" : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case "textarea":
      return (
        <TextareaField
          label={field.label}
          hint={field.hint}
          value={typeof value === "string" ? value : ""}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case "number":
      return (
        <TextField
          label={field.label}
          hint={field.hint}
          type="number"
          min={field.min}
          max={field.max}
          value={typeof value === "number" ? String(value) : ""}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (!Number.isFinite(next)) return;
            onChange(Math.min(field.max, Math.max(field.min, Math.round(next))));
          }}
        />
      );

    case "select":
      return (
        <SelectField
          label={field.label}
          hint={field.hint}
          options={field.options}
          value={typeof value === "string" ? value : (field.options[0]?.value ?? "")}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case "switch":
      return (
        <SwitchControl
          label={field.label}
          hint={field.hint}
          isChecked={value === true}
          onChange={onChange}
        />
      );
  }
}

interface SwitchControlProps {
  label: string;
  hint?: string;
  isChecked: boolean;
  onChange: (value: boolean) => void;
}

function SwitchControl({ label, hint, isChecked, onChange }: SwitchControlProps) {
  return (
    <div>
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="font-medium text-neutral-700 text-sm">{label}</span>
        <span className="relative inline-flex shrink-0">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(event) => onChange(event.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className={cn(
              "block h-5 w-9 rounded-full transition-colors duration-200",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-neutral-900 peer-focus-visible:ring-offset-2",
              isChecked ? "bg-neutral-800" : "bg-neutral-200",
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm",
              "transition-transform duration-200 ease-out",
              isChecked && "translate-x-4",
            )}
          />
        </span>
      </label>
      {hint && <p className="mt-1.5 text-neutral-500 text-xs leading-relaxed">{hint}</p>}
    </div>
  );
}
