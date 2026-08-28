import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export const SIDEBAR_ITEM_CLASSNAME = [
  "flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-sm",
  "transition-[background-color,color] duration-200 ease-out",
  "text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-900",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
].join(" ");

export const SIDEBAR_ITEM_ACTIVE_CLASSNAME = "bg-neutral-100 text-neutral-900";

export const COMPACT_ITEM_CLASSNAME = [
  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 font-medium text-sm",
  "transition-[background-color,color] duration-200 ease-out",
  "text-neutral-500 hover:text-neutral-900",
].join(" ");

interface AppShellProps {
  sidebar: ReactNode;
  compactNav: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
}

export function AppShell({ sidebar, compactNav, topbar, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[228px] flex-col border-neutral-200 border-r bg-white lg:flex">
        {sidebar}
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-[228px]">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-neutral-200 border-b bg-white/85 px-4 backdrop-blur-md lg:px-6">
          {topbar}
        </header>

        <nav className="flex gap-1 overflow-x-auto border-neutral-200 border-b bg-white px-4 py-2 lg:hidden">
          {compactNav}
        </nav>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1180px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

interface SearchTriggerProps {
  onClick: () => void;
  className?: string;
}

export function SearchTrigger({ onClick, className }: SearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 text-left text-neutral-400 text-sm",
        "transition-colors duration-200 ease-out hover:bg-neutral-100/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900",
        className,
      )}
    >
      <kbd className="hidden shrink-0 rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-medium font-sans text-[11px] text-neutral-500 sm:block">
        ⌘ + K
      </kbd>
      <span className="truncate">Busque checkouts, produtos ou integrações...</span>
    </button>
  );
}

interface AvatarProps {
  initials: string;
  className?: string;
}

export function Avatar({ initials, className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 font-semibold text-[11px] text-neutral-600",
        className,
      )}
    >
      {initials}
    </span>
  );
}
