import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { queryClient } from "@/app/query-client";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Sem devtools aqui, ao contrário do painel: este bundle vai para o celular do
 * comprador em rede móvel, e a página é a superfície que converte.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
