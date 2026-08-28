import { SERIES_COLOR } from "@/shared/ui/charts/chart-theme";

interface HorizontalBarProps {
  value: number;
  max: number;
  height?: number;
  isMuted?: boolean;
}

/**
 * Barra de medida única, ancorada na baseline (x = 0) e com 4px de raio na ponta.
 * Sem `viewBox`: as unidades do SVG são pixels, então o raio não distorce ao esticar.
 */
export function HorizontalBar({ value, max, height = 8, isMuted = false }: HorizontalBarProps) {
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const percentage = ratio === 0 ? 0 : Math.max(ratio * 100, 2);

  return (
    <svg width="100%" height={height} aria-hidden="true" focusable="false">
      <rect x={0} y={0} width="100%" height={height} rx={4} fill="#f5f5f5" />
      {percentage > 0 && (
        <rect
          x={0}
          y={0}
          width={`${percentage}%`}
          height={height}
          rx={4}
          fill={SERIES_COLOR}
          opacity={isMuted ? 0.45 : 1}
          style={{ transition: "opacity 200ms ease-out" }}
        />
      )}
    </svg>
  );
}
