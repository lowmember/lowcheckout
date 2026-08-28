import { type PointerEvent as ReactPointerEvent, useId, useMemo, useState } from "react";

import { useElementSize } from "@/shared/lib/use-element-size";
import {
  AXIS_COLOR,
  AXIS_TEXT_COLOR,
  GRID_COLOR,
  niceCeil,
  pickTickIndices,
  SERIES_COLOR,
  SERIES_FILL_BOTTOM,
  SERIES_FILL_TOP,
  VALUE_TEXT_COLOR,
} from "@/shared/ui/charts/chart-theme";
import { ChartTooltip } from "@/shared/ui/charts/chart-tooltip";

export interface AreaLinePoint {
  label: string;
  value: number;
}

const PADDING = { top: 22, right: 14, bottom: 26, left: 62 };
const GRID_STEPS = 4;

interface AreaLineChartProps {
  points: AreaLinePoint[];
  /** Formatação completa, usada no tooltip e no rótulo do pico. */
  formatValue: (value: number) => string;
  /** Formatação curta para o eixo Y. Cai no `formatValue` quando ausente. */
  formatAxisValue?: (value: number) => string;
  height?: number;
  emptyMessage: string;
  ariaLabel: string;
}

export function AreaLineChart({
  points,
  formatValue,
  formatAxisValue,
  height = 260,
  emptyMessage,
  ariaLabel,
}: AreaLineChartProps) {
  const gradientId = useId();
  const { ref, width } = useElementSize<HTMLDivElement>();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const hasData = points.some((point) => point.value > 0);
  const innerWidth = Math.max(width - PADDING.left - PADDING.right, 0);
  const innerHeight = Math.max(height - PADDING.top - PADDING.bottom, 0);

  const maxValue = useMemo(
    () => niceCeil(Math.max(...points.map((point) => point.value), 0)),
    [points],
  );

  const geometry = useMemo(() => {
    if (points.length === 0 || innerWidth === 0) {
      return { coords: [] as { x: number; y: number }[], linePath: "", areaPath: "" };
    }

    const stepX = points.length > 1 ? innerWidth / (points.length - 1) : 0;
    const coords = points.map((point, index) => {
      // Faturamento não é negativo; travar o eixo evita a linha vazar da área de plotagem.
      const ratio = Math.min(Math.max(point.value / maxValue, 0), 1);

      return {
        x: PADDING.left + (points.length > 1 ? index * stepX : innerWidth / 2),
        y: PADDING.top + innerHeight - ratio * innerHeight,
      };
    });

    const linePath = coords
      .map((coord, index) => `${index === 0 ? "M" : "L"}${coord.x} ${coord.y}`)
      .join(" ");

    const baseline = PADDING.top + innerHeight;
    const first = coords[0];
    const last = coords[coords.length - 1];
    const areaPath = `${linePath} L${last.x} ${baseline} L${first.x} ${baseline} Z`;

    return { coords, linePath, areaPath };
  }, [points, innerWidth, innerHeight, maxValue]);

  const peakIndex = useMemo(() => {
    let best = 0;
    points.forEach((point, index) => {
      if (point.value > points[best].value) best = index;
    });
    return best;
  }, [points]);

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (points.length === 0 || innerWidth === 0) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = event.clientX - bounds.left - PADDING.left;
    const ratio = Math.min(Math.max(relativeX / innerWidth, 0), 1);

    setHoveredIndex(Math.round(ratio * (points.length - 1)));
  }

  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-neutral-200 border-dashed bg-neutral-50/60"
        style={{ height }}
      >
        <p className="text-neutral-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const hoveredCoord = hoveredIndex === null ? null : geometry.coords[hoveredIndex];
  const tickIndices = pickTickIndices(points.length);
  const showAllMarkers = points.length <= 12;

  return (
    // O SVG fica absoluto de propósito: em px ele não encolhe, e se participasse do
    // fluxo travaria a largura do container medido (o ResizeObserver nunca voltaria a
    // diminuir). Fora do fluxo, a medição segue só o pai.
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          className="absolute inset-0 touch-none select-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoveredIndex(null)}
        >
          <title>{ariaLabel}</title>

          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES_FILL_TOP} />
              <stop offset="100%" stopColor={SERIES_FILL_BOTTOM} />
            </linearGradient>
          </defs>

          {/* Grid horizontal recessivo + eixo Y único. Nunca dois eixos. */}
          {Array.from({ length: GRID_STEPS + 1 }, (_, step) => {
            const value = (maxValue / GRID_STEPS) * step;
            const y = PADDING.top + innerHeight - (step / GRID_STEPS) * innerHeight;

            return (
              <g key={value}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={width - PADDING.right}
                  y2={y}
                  stroke={step === 0 ? AXIS_COLOR : GRID_COLOR}
                  strokeWidth={1}
                />
                <text
                  x={PADDING.left - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize={11}
                  fill={AXIS_TEXT_COLOR}
                >
                  {(formatAxisValue ?? formatValue)(value)}
                </text>
              </g>
            );
          })}

          <path d={geometry.areaPath} fill={`url(#${gradientId})`} />
          <path
            d={geometry.linePath}
            fill="none"
            stroke={SERIES_COLOR}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {showAllMarkers &&
            geometry.coords.map((coord, index) => (
              <circle
                key={points[index].label}
                cx={coord.x}
                cy={coord.y}
                r={4}
                fill="#fff"
                stroke={SERIES_COLOR}
                strokeWidth={2}
              />
            ))}

          {/* Rótulo numérico só no ponto que importa: o pico do período. */}
          {hoveredIndex === null && geometry.coords[peakIndex] && (
            <g>
              {!showAllMarkers && (
                <circle
                  cx={geometry.coords[peakIndex].x}
                  cy={geometry.coords[peakIndex].y}
                  r={4}
                  fill="#fff"
                  stroke={SERIES_COLOR}
                  strokeWidth={2}
                />
              )}
              <text
                x={Math.min(
                  Math.max(geometry.coords[peakIndex].x, PADDING.left + 24),
                  width - PADDING.right - 24,
                )}
                y={Math.max(geometry.coords[peakIndex].y - 12, 12)}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill={VALUE_TEXT_COLOR}
              >
                {formatValue(points[peakIndex].value)}
              </text>
            </g>
          )}

          {hoveredCoord && (
            <g>
              <line
                x1={hoveredCoord.x}
                y1={PADDING.top}
                x2={hoveredCoord.x}
                y2={PADDING.top + innerHeight}
                stroke="#d4d4d4"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <circle cx={hoveredCoord.x} cy={hoveredCoord.y} r={5} fill={SERIES_COLOR} />
              <circle
                cx={hoveredCoord.x}
                cy={hoveredCoord.y}
                r={5}
                fill="none"
                stroke="#fff"
                strokeWidth={2}
              />
            </g>
          )}

          {tickIndices.map((index) => {
            const coord = geometry.coords[index];
            if (!coord) return null;

            let anchor: "start" | "middle" | "end" = "middle";
            if (index === 0) anchor = "start";
            if (index === points.length - 1) anchor = "end";

            return (
              <text
                key={points[index].label}
                x={coord.x}
                y={height - 8}
                textAnchor={anchor}
                fontSize={11}
                fill={AXIS_TEXT_COLOR}
              >
                {points[index].label}
              </text>
            );
          })}
        </svg>
      )}

      {hoveredIndex !== null && hoveredCoord && (
        <ChartTooltip
          x={hoveredCoord.x}
          y={Math.max(hoveredCoord.y - 62, 0)}
          title={points[hoveredIndex].label}
          value={formatValue(points[hoveredIndex].value)}
          containerWidth={width}
        />
      )}
    </div>
  );
}
