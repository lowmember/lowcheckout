import type { ComponentProps } from "react";

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

export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="2.75" />
      <path d="M6.4 18.6a6.2 6.2 0 0 1 11.2 0" />
    </Icon>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 21h18" />
      <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
      <path d="M15 10h2a2 2 0 0 1 2 2v9" />
      <path d="M8.5 7h3M8.5 11h3M8.5 15h3" />
    </Icon>
  );
}

export function ListDetailsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.25" y="4.25" width="5.5" height="5.5" rx="1.5" />
      <rect x="3.25" y="14.25" width="5.5" height="5.5" rx="1.5" />
      <path d="M12.5 6h8.25M12.5 9h5.5M12.5 16h8.25M12.5 19h5.5" />
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

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 12h17" />
      <path d="m14.5 6 6 6-6 6" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20.5 12h-17" />
      <path d="m9.5 6-6 6 6 6" />
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

/* — Navegação do painel — */

export function DashboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.25" y="3.25" width="7.5" height="6" rx="1.5" />
      <rect x="3.25" y="12.25" width="7.5" height="8.5" rx="1.5" />
      <rect x="13.25" y="3.25" width="7.5" height="8.5" rx="1.5" />
      <rect x="13.25" y="14.75" width="7.5" height="6" rx="1.5" />
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

export function CartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.75 4h2.1l2.05 10.4a1.5 1.5 0 0 0 1.47 1.2h8.4a1.5 1.5 0 0 0 1.47-1.16L20 7.5H6" />
      <circle cx="9.5" cy="19.25" r="1.25" />
      <circle cx="17" cy="19.25" r="1.25" />
    </Icon>
  );
}

export function SalesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 17.5 9 11.75l3.5 3.25 3-3.75" />
      <path d="M15.5 8.5h4.75v4.75" />
      <path d="m20.25 8.5-4.75 5.5" />
      <path d="M3.5 4v16.25h17" />
    </Icon>
  );
}

export function PlugIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 3.25v5M15 3.25v5" />
      <path d="M6 8.25h12v3.5a6 6 0 0 1-6 6 6 6 0 0 1-6-6z" />
      <path d="M12 17.75v3" />
    </Icon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="2.75" />
      <path d="M19.4 14.4a1.5 1.5 0 0 0 .3 1.65l.06.06a1.8 1.8 0 1 1-2.55 2.55l-.06-.06a1.5 1.5 0 0 0-2.55 1.06v.17a1.8 1.8 0 1 1-3.6 0v-.09a1.5 1.5 0 0 0-2.6-1.02l-.06.06a1.8 1.8 0 1 1-2.55-2.55l.06-.06a1.5 1.5 0 0 0-1.06-2.55h-.17a1.8 1.8 0 1 1 0-3.6h.09A1.5 1.5 0 0 0 5.6 7.5l-.06-.06a1.8 1.8 0 0 1 2.55-2.55l.06.06a1.5 1.5 0 0 0 2.55-1.06v-.17a1.8 1.8 0 1 1 3.6 0v.09a1.5 1.5 0 0 0 2.6 1.02l.06-.06a1.8 1.8 0 1 1 2.55 2.55l-.06.06a1.5 1.5 0 0 0 1.06 2.55h.17a1.8 1.8 0 0 1 0 3.6h-.09a1.5 1.5 0 0 0-1.19.87z" />
    </Icon>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 8.75a6 6 0 1 0-12 0c0 5-2.25 6.5-2.25 6.5h16.5S18 13.75 18 8.75" />
      <path d="M13.75 19a2 2 0 0 1-3.5 0" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.2 16.2 4.05 4.05" />
    </Icon>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14.5 3.75h3a2 2 0 0 1 2 2v12.5a2 2 0 0 1-2 2h-3" />
      <path d="M10 16.5 14.5 12 10 7.5" />
      <path d="M14.5 12h-11" />
    </Icon>
  );
}

/* — Ações — */

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4.75v14.5M4.75 12h14.5" />
    </Icon>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20h4.25L19.5 8.75a2.3 2.3 0 0 0-3.25-3.25L5 16.75z" />
      <path d="m15 6.75 2.25 2.25" />
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

export function CopyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="9" y="9" width="11.25" height="11.25" rx="2" />
      <path d="M15 6.25V5.75a2 2 0 0 0-2-2H5.75a2 2 0 0 0-2 2V13a2 2 0 0 0 2 2h.5" />
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

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Icon>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4.25h5.75V10" />
      <path d="M19.75 4.25 11 13" />
      <path d="M18.5 14v4.25a2 2 0 0 1-2 2H5.75a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2H10" />
    </Icon>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 13.5a3.5 3.5 0 0 0 5.2.4l3-3a3.5 3.5 0 0 0-4.95-4.95l-1.7 1.7" />
      <path d="M14 10.5a3.5 3.5 0 0 0-5.2-.4l-3 3a3.5 3.5 0 0 0 4.95 4.95l1.7-1.7" />
    </Icon>
  );
}

export function CodeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m8.5 8-4.25 4 4.25 4" />
      <path d="m15.5 8 4.25 4-4.25 4" />
      <path d="m13.5 4.75-3 14.5" />
    </Icon>
  );
}

export function MonitorIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.75" y="4.25" width="18.5" height="12" rx="2" />
      <path d="M8.5 20h7M12 16.25V20" />
    </Icon>
  );
}

export function SmartphoneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="6.75" y="2.75" width="10.5" height="18.5" rx="2.5" />
      <path d="M10.75 18.25h2.5" />
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

export function AlertTriangleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10.7 4.1 2.9 17.5a1.5 1.5 0 0 0 1.3 2.25h15.6a1.5 1.5 0 0 0 1.3-2.25L13.3 4.1a1.5 1.5 0 0 0-2.6 0" />
      <path d="M12 9.5v4M12 16.75h.01" />
    </Icon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.25M12 7.75h.01" />
    </Icon>
  );
}

/* — Status de venda (verde / âmbar / vermelho, sempre com rótulo) — */

export function RevenueUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.75" y="5.25" width="18.5" height="13.5" rx="2.5" />
      <path d="M12 15.5V9.25" />
      <path d="m9.5 11.5 2.5-2.25 2.5 2.25" />
    </Icon>
  );
}

export function ReceiptCheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 3.75h14v17l-2.3-1.5-2.35 1.5L12 19.25 9.65 20.75 7.3 19.25 5 20.75z" />
      <path d="m8.75 11 2.25 2.25 4.25-4.5" />
    </Icon>
  );
}

export function ReceiptClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 3.75h14v17l-2.3-1.5-2.35 1.5L12 19.25 9.65 20.75 7.3 19.25 5 20.75z" />
      <circle cx="12" cy="10.75" r="3.25" />
      <path d="M12 9v1.9l1.25.9" />
    </Icon>
  );
}

export function ReceiptXIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 3.75h14v17l-2.3-1.5-2.35 1.5L12 19.25 9.65 20.75 7.3 19.25 5 20.75z" />
      <path d="m9.75 8.75 4.5 4.5M14.25 8.75l-4.5 4.5" />
    </Icon>
  );
}

export function TicketIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.25 8.5V6.75a1.5 1.5 0 0 1 1.5-1.5h14.5a1.5 1.5 0 0 1 1.5 1.5V8.5a2.5 2.5 0 0 0 0 7v1.75a1.5 1.5 0 0 1-1.5 1.5H4.75a1.5 1.5 0 0 1-1.5-1.5V15.5a2.5 2.5 0 0 0 0-7" />
      <path d="M13.5 5.25v2M13.5 11v2M13.5 16.75v2" />
    </Icon>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7.25 3.75h9.5v5a4.75 4.75 0 0 1-9.5 0z" />
      <path d="M7.25 5.5H4.5v1.25a3.25 3.25 0 0 0 3 3.24" />
      <path d="M16.75 5.5h2.75v1.25a3.25 3.25 0 0 1-3 3.24" />
      <path d="M12 13.5v3.25M8.75 20.25h6.5l-.75-3.5h-5z" />
    </Icon>
  );
}

/* — Marca de terceiro — */

export function GoogleIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className} {...props}>
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.68-.06-1.34-.18-1.96H12v3.71h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.27"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.23-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.58A10 10 0 0 0 12 22"
      />
      <path fill="#FBBC05" d="M6.41 13.91a6 6 0 0 1 0-3.82V7.51H3.07a10 10 0 0 0 0 8.98z" />
      <path
        fill="#EA4335"
        d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.86-2.86C16.95 2.99 14.7 2 12 2a10 10 0 0 0-8.93 5.51l3.34 2.58C7.2 7.73 9.4 5.98 12 5.98"
      />
    </svg>
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

export function StarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L4.2 9.7l5.4-.8L12 4Z" />
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

export function GripIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" strokeWidth={2.5} />
    </Icon>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </Icon>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 4.5 20 20" />
      <path d="M9.9 6a8.6 8.6 0 0 1 2.1-.25c6 0 9.5 6.25 9.5 6.25a15.4 15.4 0 0 1-3 3.6" />
      <path d="M6.7 8.1A15.5 15.5 0 0 0 2.5 12S6 18.25 12 18.25c1.2 0 2.3-.2 3.3-.6" />
      <path d="M10.2 10.4a2.75 2.75 0 0 0 3.6 3.9" />
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

export function ArrowDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </Icon>
  );
}

export function PaletteIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.1 0 1.9-.9 1.9-1.9 0-.5-.2-.9-.5-1.3-.3-.3-.5-.8-.5-1.2 0-1 .9-1.9 1.9-1.9h1.4a4.3 4.3 0 0 0 4.3-4.3c0-3.6-3.8-6.4-8.5-6.4Z" />
      <path d="M7.5 11.5h.01M10 8h.01M14.5 8h.01" strokeWidth={2.5} />
    </Icon>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m12 3.5 8 4.25-8 4.25-8-4.25L12 3.5Z" />
      <path d="m4 12 8 4.25L20 12" />
      <path d="m4 16.25 8 4.25 8-4.25" />
    </Icon>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M11 4.5 12.4 8l3.6 1.4-3.6 1.4L11 14.5 9.6 10.9 6 9.5l3.6-1.4L11 4.5Z" />
      <path d="M17.5 14.5 18.3 16.5l2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
    </Icon>
  );
}

export function RocketIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13.5 4.5c3.4-1.5 6 .1 6 .1s1.6 2.6.1 6c-1.2 2.7-4.3 5.2-6.4 6.2l-3.9-3.9c1-2.1 3.5-5.2 6.2-6.4Z" />
      <path d="M9.3 12.9 6.5 12l-2 2.5 3 1.2M11.1 14.7l.9 2.8 2.5-2-1.2-3" />
      <path d="M6.5 17.5 4.5 19.5" />
      <circle cx="15" cy="9" r="1.4" />
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

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </Icon>
  );
}

export function TypographyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 7V5.5h14V7" />
      <path d="M12 5.5v13M9 18.5h6" />
    </Icon>
  );
}

export function HelpCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.8 9.6A2.3 2.3 0 0 1 14.3 10c0 1.5-2.3 1.9-2.3 3.3" />
      <path d="M12 16.5h.01" strokeWidth={2.5} />
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
