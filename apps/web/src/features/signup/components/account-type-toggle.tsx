import type { AccountDocumentType } from "@/features/account";
import { cn } from "@/shared/lib/cn";
import { BuildingIcon, UserIcon } from "@/shared/ui/icons";

const DOCUMENT_TYPE_LABELS: Record<AccountDocumentType, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
};

const DOCUMENT_TYPES = Object.keys(DOCUMENT_TYPE_LABELS) as AccountDocumentType[];

interface AccountTypeToggleProps {
  value: AccountDocumentType;
  onChange: (documentType: AccountDocumentType) => void;
}

export function AccountTypeToggle({ value, onChange }: AccountTypeToggleProps) {
  return (
    <fieldset>
      <legend className="mb-2 block font-medium text-neutral-700 text-sm">Tipo de conta</legend>

      <div className="grid grid-cols-2 gap-3">
        {DOCUMENT_TYPES.map((documentType) => {
          const isSelected = documentType === value;
          const Icon = documentType === "cpf" ? UserIcon : BuildingIcon;

          return (
            <button
              key={documentType}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(documentType)}
              className={cn(
                "group flex h-10 items-center justify-center gap-2 rounded-lg border bg-white font-medium text-sm",
                "transition-[color,border-color,box-shadow,scale] duration-200 ease-out active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
                isSelected
                  ? "border-neutral-900 text-neutral-900 shadow-neutral-900/5 shadow-sm"
                  : "border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600",
              )}
            >
              <Icon
                className={cn(
                  "size-4 transition-transform duration-200 ease-out",
                  isSelected ? "animate-pop-in" : "group-hover:scale-110",
                )}
              />
              {DOCUMENT_TYPE_LABELS[documentType]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
