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
