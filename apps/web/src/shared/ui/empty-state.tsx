import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-neutral-200 border-dashed bg-neutral-50/60 px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400">
          {icon}
        </div>
      )}
      <p className="font-medium text-neutral-800 text-sm">{title}</p>
      {description && (
        <p className="mt-1 max-w-95 text-neutral-500 text-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
