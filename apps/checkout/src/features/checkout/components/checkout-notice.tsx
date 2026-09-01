import type { ReactNode } from "react";

interface CheckoutNoticeProps {
  icon: ReactNode;
  title: string;
  description: string;
}

/**
 * Estado terminal fora do tema do checkout.
 *
 * De propósito: quando o slug não resolve, não existe tema — não há checkout
 * para ler cor nenhuma. É a única tela deste app que tem visual próprio.
 */
export function CheckoutNotice({ icon, title, description }: CheckoutNoticeProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-400">
          {icon}
        </span>
        <h1 className="font-semibold text-lg text-neutral-900 tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* — Os dois ícones desta tela; o resto do app desenha pelo renderizador — */

export function AlertTriangleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-6"
    >
      <path d="M10.7 4.1 2.9 17.5a1.5 1.5 0 0 0 1.3 2.25h15.6a1.5 1.5 0 0 0 1.3-2.25L13.3 4.1a1.5 1.5 0 0 0-2.6 0" />
      <path d="M12 9.5v4M12 16.75h.01" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-6"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}
