import { createFileRoute } from "@tanstack/react-router";

import { PublicCheckoutPage } from "@/features/checkouts";

/**
 * Página pública do vínculo checkout+oferta. Fora de `_app`: sem sessão, sem
 * navegação do painel — é o que o comprador acessa.
 */
export const Route = createFileRoute("/c/$publicSlug")({
  component: PublicCheckoutRoute,
});

function PublicCheckoutRoute() {
  const { publicSlug } = Route.useParams();

  return <PublicCheckoutPage publicSlug={publicSlug} />;
}
