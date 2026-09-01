import { QueryClient } from "@tanstack/react-query";

/**
 * O comprador abre a página, paga e sai. Não há navegação entre telas nem
 * cache para reaproveitar depois — por isso nada de `staleTime` global: cada
 * query deste app declara o seu, que é onde a decisão realmente importa
 * (o checkout lê uma vez; o status do pedido, em laço).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
