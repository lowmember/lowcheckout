import type { CheckoutSchema, CheckoutSectionType } from "@lowcheckout/checkout-renderer";
import { getSectionDefinition, SECTION_TYPES } from "@lowcheckout/checkout-renderer";

import { SECTION_ICONS } from "@/features/checkouts/components/builder/section-icons";
import { canAddSection } from "@/features/checkouts/lib/schema-operations";
import { cn } from "@/shared/lib/cn";
import { Dialog } from "@/shared/ui/dialog";
import { CheckIcon, PlusIcon } from "@/shared/ui/icons";

interface AddSectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schema: CheckoutSchema;
  onAdd: (type: CheckoutSectionType) => void;
}

export function AddSectionDialog({ isOpen, onClose, schema, onAdd }: AddSectionDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar seção"
      description="A seção entra no fim da página e pode ser reordenada depois."
      className="max-w-lg"
    >
      <ul className="space-y-2">
        {SECTION_TYPES.map((type) => {
          const definition = getSectionDefinition(type);
          const isAvailable = canAddSection(schema, type);

          return (
            <li key={type}>
              <button
                type="button"
                disabled={!isAvailable}
                onClick={() => {
                  onAdd(type);
                  onClose();
                }}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left",
                  "transition-[background-color,border-color] duration-200 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900",
                  isAvailable
                    ? "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                    : "cursor-not-allowed border-neutral-100 bg-neutral-50/60",
                )}
              >
                <span
                  className={cn("shrink-0", isAvailable ? "text-neutral-500" : "text-neutral-300")}
                >
                  {SECTION_ICONS[type]}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block font-medium text-sm",
                      isAvailable ? "text-neutral-900" : "text-neutral-400",
                    )}
                  >
                    {definition.label}
                  </span>
                  <span className="block text-neutral-500 text-xs leading-relaxed">
                    {isAvailable ? definition.description : "Já está na página."}
                  </span>
                </span>

                <span className="shrink-0 text-neutral-300">
                  {isAvailable ? (
                    <PlusIcon className="size-4 transition-colors group-hover:text-neutral-700" />
                  ) : (
                    <CheckIcon className="size-4 text-emerald-500" />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}
