import { useState } from "react";

import { PropertyControl } from "@/features/checkouts/components/builder/property-control";
import { isRecord } from "@/features/checkouts/lib/schema-normalizers";
import type { ListPropertyField } from "@/features/checkouts/lib/section-registry";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
} from "@/shared/ui/icons";

interface PropertyListControlProps {
  field: ListPropertyField;
  value: unknown;
  onChange: (value: unknown) => void;
}

/** Lista editável (benefícios, depoimentos, FAQ, links) dirigida pelo descritor. */
export function PropertyListControl({ field, value, onChange }: PropertyListControlProps) {
  const items = Array.isArray(value) ? value.filter(isRecord) : [];
  const [openItemIndex, setOpenItemIndex] = useState<number | null>(0);

  function replace(next: Record<string, unknown>[]) {
    onChange(next);
  }

  function updateItem(index: number, key: string, itemValue: unknown) {
    replace(items.map((item, i) => (i === index ? { ...item, [key]: itemValue } : item)));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;

    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    replace(next);
    setOpenItemIndex(to);
  }

  return (
    <div>
      <p className="mb-2 font-medium text-neutral-700 text-sm">{field.label}</p>

      {items.length === 0 && (
        <p className="mb-2 rounded-lg border border-neutral-200 border-dashed px-3 py-4 text-center text-neutral-500 text-xs">
          Nenhum item ainda.
        </p>
      )}

      <ul className="space-y-1.5">
        {items.map((item, index) => {
          const isOpen = openItemIndex === index;
          const title = String(item[field.titleKey] ?? "").trim() || `Item ${index + 1}`;

          return (
            <li
              key={String(item.id ?? index)}
              className="overflow-hidden rounded-lg border border-neutral-200"
            >
              <div className="flex items-center gap-0.5 bg-neutral-50/70 pr-1.5">
                <button
                  type="button"
                  onClick={() => setOpenItemIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                >
                  <ChevronDownIcon
                    className={cn(
                      "size-3.5 shrink-0 text-neutral-400 transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  />
                  <span className="truncate font-medium text-neutral-700 text-xs">{title}</span>
                </button>

                <button
                  type="button"
                  aria-label="Mover para cima"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  className="rounded p-1 text-neutral-400 transition-colors hover:text-neutral-800 disabled:opacity-30"
                >
                  <ArrowUpIcon className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Mover para baixo"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, index + 1)}
                  className="rounded p-1 text-neutral-400 transition-colors hover:text-neutral-800 disabled:opacity-30"
                >
                  <ArrowDownIcon className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Remover item"
                  onClick={() => {
                    replace(items.filter((_, i) => i !== index));
                    setOpenItemIndex(null);
                  }}
                  className="rounded p-1 text-neutral-400 transition-colors hover:text-red-600"
                >
                  <TrashIcon className="size-3.5" />
                </button>
              </div>

              {isOpen && (
                <div className="space-y-4 border-neutral-200 border-t p-3">
                  {field.itemFields.map((itemField) => (
                    <PropertyControl
                      key={itemField.key}
                      field={itemField}
                      value={item[itemField.key]}
                      onChange={(next) => updateItem(index, itemField.key, next)}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {items.length < field.maxItems && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-2 w-full"
          onClick={() => {
            replace([...items, field.createItem()]);
            setOpenItemIndex(items.length);
          }}
        >
          <PlusIcon className="size-4" />
          {field.addLabel}
        </Button>
      )}
    </div>
  );
}
