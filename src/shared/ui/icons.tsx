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

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 12h17" />
      <path d="m14.5 6 6 6-6 6" />
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
