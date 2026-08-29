import { cn } from "@/shared/lib/cn";
import { useCopyToClipboard } from "@/shared/lib/use-copy-to-clipboard";
import { CheckIcon, CopyIcon } from "@/shared/ui/icons";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label = "Copiar", className }: CopyButtonProps) {
  const { copy, copiedValue } = useCopyToClipboard();
  const wasCopied = copiedValue === value;

  return (
    <button
      type="button"
      onClick={() => void copy(value)}
      aria-label={wasCopied ? "Copiado" : label}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 font-medium text-xs",
        "transition-[color,border-color,background-color] duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1",
        wasCopied
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "text-neutral-600 hover:border-neutral-300 hover:text-neutral-900",
        className,
      )}
    >
      {wasCopied ? (
        <CheckIcon className="size-3.5 animate-pop-in" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
      {wasCopied ? "Copiado" : label}
    </button>
  );
}
