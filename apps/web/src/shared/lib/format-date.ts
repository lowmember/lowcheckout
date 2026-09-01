const TIME_ZONE = "America/Sao_Paulo";

export function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(new Date(isoDate));
}

export function formatDateTime(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(new Date(isoDate));
}

/** Rótulo curto de eixo: "11 jul" para dia, "14h" para hora. */
export function formatAxisLabel(isoDate: string, granularity: "day" | "hour") {
  const date = new Date(isoDate);

  if (granularity === "hour") {
    return `${new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      timeZone: TIME_ZONE,
    }).format(date)}h`;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: TIME_ZONE,
  })
    .format(date)
    .replace(".", "")
    .replace(" de ", " ");
}

/** ISO curto (yyyy-mm-dd) de hoje, usado como default do período personalizado. */
export function toDateInputValue(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);
}

/** "agora", "há 5 min", "há 3 h", "há 2 d" — precisão suficiente para o sino. */
export function formatRelativeTime(isoDate: string, now: Date = new Date()) {
  const elapsedInMinutes = Math.floor((now.getTime() - new Date(isoDate).getTime()) / 60_000);

  if (elapsedInMinutes < 1) return "agora";
  if (elapsedInMinutes < 60) return `há ${elapsedInMinutes} min`;

  const elapsedInHours = Math.floor(elapsedInMinutes / 60);
  if (elapsedInHours < 24) return `há ${elapsedInHours} h`;

  const elapsedInDays = Math.floor(elapsedInHours / 24);
  if (elapsedInDays < 7) return `há ${elapsedInDays} d`;

  return formatDate(isoDate);
}
