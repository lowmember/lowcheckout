import { cn } from "@/shared/lib/cn";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/logo.svg"
      alt="Low Checkout"
      width={158}
      height={28}
      className={cn("h-7", className)}
    />
  );
}
