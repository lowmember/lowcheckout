import { type ReactNode, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/lib/cn";
import { SearchIcon } from "@/shared/ui/icons";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandItem[];
  onSelect: (id: string) => void;
  placeholder?: string;
}

/** Filtro local sobre os itens recebidos. Não existe busca no backend. */
export function CommandPalette({
  isOpen,
  onClose,
  items,
  onSelect,
  placeholder = "Buscar...",
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((item) =>
      `${item.label} ${item.description ?? ""}`.toLowerCase().includes(normalized),
    );
  }, [items, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      onClose();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, results.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const item = results[activeIndex];
      if (item) onSelect(item.id);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Fechar busca"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in cursor-default bg-neutral-900/25 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Busca"
        className="relative w-full max-w-lg animate-pop-in overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-neutral-900/10 shadow-xl"
      >
        <div className="flex items-center gap-2.5 border-neutral-200 border-b px-4">
          <SearchIcon className="size-4 shrink-0 text-neutral-400" />
          <input
            ref={(node) => {
              node?.focus();
            }}
            value={query}
            placeholder={placeholder}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 w-full bg-transparent text-neutral-900 text-sm outline-none placeholder:text-neutral-400"
          />
        </div>

        {results.length === 0 ? (
          <p className="px-4 py-8 text-center text-neutral-500 text-sm">
            Nada encontrado para “{query}”.
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto p-1.5">
            {results.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm",
                    "transition-colors duration-150",
                    index === activeIndex ? "bg-neutral-100 text-neutral-900" : "text-neutral-600",
                  )}
                >
                  {item.icon}
                  <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                  {item.description && (
                    <span className="shrink-0 text-neutral-400 text-xs">{item.description}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>,
    document.body,
  );
}
