import type { ComponentProps } from "react";

/**
 * O subconjunto de ícones que o renderizador desenha.
 *
 * É uma cópia deliberada do `shared/ui/icons` do painel: o pacote não pode
 * depender de um app, e um `packages/ui` inteiro para doze traçados de SVG
 * custaria mais do que a duplicação. São paths estáticos — se um deles mudar
 * no painel, a página do comprador não regride junto.
 */

type IconProps = ComponentProps<"svg">;

function Icon({ children, ...props }: IconProps) {
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
      {...props}
    >
      {children}
    </svg>
  );
}

export function AlarmIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="13" r="7.25" />
      <path d="M12 9.75V13l2.25 1.5M5 4.5 2.75 6.75M19 4.5l2.25 2.25" />
    </Icon>
  );
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </Icon>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4.75 12.5 4.75 4.75 9.75-10.5" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9.5 6 6 6-6" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </Icon>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="9" y="9" width="11.25" height="11.25" rx="2" />
      <path d="M15 6.25V5.75a2 2 0 0 0-2-2H5.75a2 2 0 0 0-2 2V13a2 2 0 0 0 2 2h.5" />
    </Icon>
  );
}

export function GripIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" strokeWidth={2.5} />
    </Icon>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.25" y="4.25" width="17.5" height="15.5" rx="2" />
      <circle cx="8.75" cy="9.5" r="1.5" />
      <path d="m4 17.25 5-5 4.5 4.5 3-2.75 4.25 4" />
    </Icon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </Icon>
  );
}

export function PackageIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.25 20.25 7.6v8.8L12 20.75 3.75 16.4V7.6z" />
      <path d="M3.9 7.7 12 12l8.1-4.3" />
      <path d="M12 12v8.6" />
    </Icon>
  );
}

export function QrCodeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1.2" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" />
      <path d="M14 14h2.5v2.5H14zM19.5 14H20v.5M14 19.5v.5h.5M19 19h1v1h-1z" />
    </Icon>
  );
}

export function QuoteIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.5 6.5C7 7.6 5.5 10 5.5 12.8v4.7h5v-5.2h-2.6c0-1.9.7-3.3 2.4-4.2l-.8-1.6ZM18 6.5c-2.5 1.1-4 3.5-4 6.3v4.7h5v-5.2h-2.6c0-1.9.7-3.3 2.4-4.2L18 6.5Z" />
    </Icon>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3 5 6v6c0 4.2 2.8 7.7 7 9 4.2-1.3 7-4.8 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 6.5h15" />
      <path d="M9.5 6.5V4.75a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V6.5" />
      <path d="M6.5 6.5 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12.5" />
      <path d="M10.5 10.25v6M13.5 10.25v6" />
    </Icon>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L4.2 9.7l5.4-.8L12 4Z" />
    </Icon>
  );
}

export function SpinnerIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`animate-spin ${className ?? ""}`.trim()}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2.5} opacity={0.25} />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
