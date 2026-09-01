import type { PixelProvider } from "@lowcheckout/contracts";

/**
 * Disparo dos pixels do checkout acessado (RF-PUB-08).
 *
 * Regra que manda em tudo aqui: **falha de pixel não interrompe a compra**.
 * Script de terceiro que não carrega, bloqueador de anúncio, `fbq` indefinido —
 * nada disso pode impedir o comprador de gerar o PIX. Por isso cada disparo é
 * um `try/catch` mudo e nenhuma função devolve erro para quem chamou.
 *
 * Só os pixels do checkout que o comprador abriu entram: a API já filtra por
 * vínculo e devolve apenas os habilitados, e este módulo não conhece outra
 * fonte.
 */

export interface CheckoutPixel {
  provider: PixelProvider;
  externalId: string;
}

interface PurchasePayload {
  orderId: string;
  amountInCents: number;
  currency: string;
}

type FacebookPixel = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: FacebookPixel & { callMethod?: FacebookPixel; queue?: unknown[]; loaded?: boolean };
    _fbq?: unknown;
    pixelId?: string;
  }
}

const FACEBOOK_SCRIPT_URL = "https://connect.facebook.net/en_US/fbevents.js";
const UTMIFY_SCRIPT_URL = "https://cdn.utmify.com.br/scripts/pixel/pixel.js";

/** Uma carga por sessão de página: StrictMode monta o efeito duas vezes em dev. */
let hasLoaded = false;

/**
 * Injeta os scripts e dispara a visualização da página.
 *
 * `PageView` sai daqui, e não de um efeito separado, porque o Facebook exige
 * que o primeiro evento venha depois do `init` — separar os dois abriria uma
 * janela em que o evento se perde.
 */
export function loadPixels(pixels: CheckoutPixel[]): void {
  if (hasLoaded || pixels.length === 0) {
    return;
  }

  hasLoaded = true;

  for (const pixel of pixels) {
    try {
      if (pixel.provider === "facebook") {
        loadFacebookPixel(pixel.externalId);
      }

      if (pixel.provider === "utmify") {
        loadUtmifyPixel(pixel.externalId);
      }
    } catch {
      // Um provider quebrado não pode derrubar os outros nem a página.
    }
  }
}

/** O comprador enviou os dados e a cobrança nasceu. */
export function trackInitiateCheckout(payload: Omit<PurchasePayload, "orderId">): void {
  track("InitiateCheckout", {
    value: payload.amountInCents / 100,
    currency: payload.currency,
  });
}

/** Pagamento confirmado. `orderId` vira `event_id`: reentrega não conta duas vezes. */
export function trackPurchase(payload: PurchasePayload): void {
  track(
    "Purchase",
    { value: payload.amountInCents / 100, currency: payload.currency },
    payload.orderId,
  );
}

function track(event: string, parameters: Record<string, unknown>, eventId?: string): void {
  try {
    window.fbq?.("track", event, parameters, eventId ? { eventID: eventId } : undefined);
  } catch {
    // idem: silêncio é o comportamento correto.
  }
}

/**
 * Snippet oficial do Facebook, transcrito. A fila (`fbq.queue`) existe para que
 * eventos disparados antes de o script baixar não se percam — é ela que torna
 * seguro chamar `track` logo depois do `init`.
 */
function loadFacebookPixel(externalId: string): void {
  let fbq = window.fbq;

  if (!fbq) {
    const queue: unknown[] = [];

    // A função precisa se referenciar para consultar `callMethod`, que o
    // fbevents.js define ao carregar. O `queued` nomeado é o que dá esse
    // ponto fixo sem depender da variável externa ainda não atribuída.
    const queued = Object.assign(
      function pixel(...args: unknown[]) {
        if (queued.callMethod) {
          queued.callMethod(...args);
          return;
        }

        queue.push(args);
      },
      { queue, loaded: true } as { queue: unknown[]; loaded: boolean; callMethod?: FacebookPixel },
    );

    fbq = queued;
    window.fbq = queued;
    window._fbq = queued;

    appendScript(FACEBOOK_SCRIPT_URL);
  }

  fbq("init", externalId);
  fbq("track", "PageView");
}

/**
 * A Utmify lê o id de `window.pixelId` e rastreia sozinha a partir daí — não há
 * API de evento para chamar, e é por isso que ela não aparece em `track`.
 */
function loadUtmifyPixel(externalId: string): void {
  window.pixelId = externalId;
  appendScript(UTMIFY_SCRIPT_URL);
}

function appendScript(src: string): void {
  const script = document.createElement("script");
  script.async = true;
  script.defer = true;
  script.src = src;
  document.head.appendChild(script);
}
