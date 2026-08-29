import type { ReactNode } from "react";

interface AuthHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function AuthHeader({ icon, title, description }: AuthHeaderProps) {
  return (
    <header className="flex flex-col items-center text-center">
      <div className="flex size-11 animate-pop-in items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 shadow-neutral-900/5 shadow-sm">
        {icon}
      </div>
      <h1 className="mt-3.5 font-semibold text-lg text-neutral-900 tracking-tight">{title}</h1>
      <p className="mt-1.5 max-w-[280px] text-neutral-500 text-sm leading-relaxed">{description}</p>
    </header>
  );
}
