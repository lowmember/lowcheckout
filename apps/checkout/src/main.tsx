import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppProviders } from "@/app/providers";
import { PublicCheckoutPage, resolvePublicSlug } from "@/features/checkout";
import { AlertTriangleIcon, CheckoutNotice } from "@/features/checkout/components/checkout-notice";

import "@/styles/global.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element "#root" not found');
}

/**
 * O slug é lido uma vez, do caminho, e nunca muda enquanto a aba vive: este app
 * não navega. Ler aqui — e não dentro de um componente — deixa explícito que a
 * URL é entrada do programa, não estado de tela.
 */
const publicSlug = resolvePublicSlug(window.location.pathname);

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      {publicSlug === null ? (
        <CheckoutNotice
          icon={<AlertTriangleIcon />}
          title="Endereço inválido"
          description="Este link não aponta para nenhum checkout. Confira o endereço com quem te enviou."
        />
      ) : (
        <PublicCheckoutPage publicSlug={publicSlug} />
      )}
    </AppProviders>
  </StrictMode>,
);
