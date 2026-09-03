import { useMemo } from "react";

import { AlarmIcon } from "../../internal/icons";
import { useCountdown } from "../../internal/use-countdown";
import { bodySize } from "../../lib/checkout-theme";
import type { CountdownProps } from "../../types/checkout-schema";
import { SectionContainer } from "../renderer-primitives";

interface CountdownSectionProps {
  props: CountdownProps;
}

/**
 * Barra de urgência do topo. O prazo é por visita — nasce quando a página
 * monta —, então não há data guardada no schema: o lojista escolhe a duração,
 * não um instante. Zerado, a barra ou troca a mensagem ou some de vez.
 */
export function CountdownSection({ props }: CountdownSectionProps) {
  const deadline = useMemo(
    () => new Date(Date.now() + props.minutes * 60_000).toISOString(),
    [props.minutes],
  );

  const remainingSeconds = useCountdown(deadline) ?? 0;
  const hasExpired = remainingSeconds <= 0;
  const message = hasExpired ? props.expiredMessage.trim() : props.message.trim();

  if (hasExpired && message.length === 0) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <SectionContainer
      isBleed
      style={{
        paddingBlock: "0.625rem",
        backgroundColor: "var(--lc-primary)",
        color: "var(--lc-primary-text)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[46rem] flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-4">
        <div className="flex items-center gap-2">
          <TimeBlock value={minutes} label="MIN" />
          <span className="font-semibold opacity-70" style={{ fontSize: bodySize(1.1) }}>
            :
          </span>
          <TimeBlock value={seconds} label="SEG" />
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <AlarmIcon className="size-5 shrink-0 opacity-90" />
          <p className="leading-snug" style={{ fontSize: bodySize(0.82) }}>
            {message}
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span className="font-bold tabular-nums" style={{ fontSize: bodySize(1.15) }}>
        {String(value).padStart(2, "0")}
      </span>
      <span className="font-medium tracking-wider opacity-75" style={{ fontSize: bodySize(0.5) }}>
        {label}
      </span>
    </div>
  );
}
