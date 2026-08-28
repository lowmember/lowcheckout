import { cn } from "@/shared/lib/cn";

interface ChartTooltipProps {
  x: number;
  y?: number;
  title: string;
  value: string;
  detail?: string;
  containerWidth: number;
  className?: string;
}

/**
 * Tooltip da camada de hover. Fica fora do SVG para herdar tipografia e sombra
 * do restante da UI, e é `pointer-events-none` para não brigar com a área de acerto.
 */
export function ChartTooltip({
  x,
  y = 8,
  title,
  value,
  detail,
  containerWidth,
  className,
}: ChartTooltipProps) {
  const clampedX = Math.min(Math.max(x, 76), Math.max(containerWidth - 76, 76));

  return (
    <div
      role="status"
      style={{ left: clampedX, top: y }}
      className={cn(
        "pointer-events-none absolute z-10 -translate-x-1/2 animate-fade-in rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 shadow-neutral-900/10 shadow-md",
        className,
      )}
    >
      <p className="whitespace-nowrap text-[11px] text-neutral-500 leading-tight">{title}</p>
      <p className="whitespace-nowrap font-semibold text-neutral-900 text-sm leading-tight">
        {value}
      </p>
      {detail && (
        <p className="mt-0.5 whitespace-nowrap text-[11px] text-neutral-500 leading-tight">
          {detail}
        </p>
      )}
    </div>
  );
}
