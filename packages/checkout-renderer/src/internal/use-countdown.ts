import { useEffect, useState } from "react";

/**
 * Segundos restantes até `deadline`, atualizados a cada segundo.
 *
 * Devolve `null` quando não há prazo e `0` quando ele já passou — quem consome
 * decide o que mostrar, o hook não decide por ninguém. O intervalo se
 * desmonta sozinho ao chegar em zero: um checkout expirado não fica gastando
 * timer no celular do comprador.
 */
export function useCountdown(deadline: string | null | undefined) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => toRemaining(deadline));

  useEffect(() => {
    setRemainingSeconds(toRemaining(deadline));

    if (deadline === null || deadline === undefined) {
      return;
    }

    const interval = setInterval(() => {
      const next = toRemaining(deadline);
      setRemainingSeconds(next);

      if (next !== null && next <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return remainingSeconds;
}

/** `mm:ss`, ou `hh:mm:ss` quando o prazo passa de uma hora. */
export function formatCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (value: number) => String(value).padStart(2, "0");

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

function toRemaining(deadline: string | null | undefined) {
  if (deadline === null || deadline === undefined) {
    return null;
  }

  const timestamp = Date.parse(deadline);

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return Math.max(0, Math.floor((timestamp - Date.now()) / 1000));
}
