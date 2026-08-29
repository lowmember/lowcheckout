import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/lib/cn";
import { CloseIcon } from "@/shared/ui/icons";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in cursor-default bg-neutral-900/25 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[88vh] w-full max-w-lg animate-pop-in flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-neutral-900/10 shadow-xl",
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-neutral-200 border-b px-5 py-4">
          <div>
            <h2 className="font-semibold text-base text-neutral-900 tracking-tight">{title}</h2>
            {description && (
              <p className="mt-1 text-neutral-500 text-sm leading-relaxed">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="-mr-1 rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        {children && <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>}

        {footer && (
          <footer className="flex items-center justify-end gap-2 border-neutral-200 border-t bg-neutral-50/70 px-5 py-3.5">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
