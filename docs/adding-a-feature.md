# Receita: criar uma nova feature

Exemplo: slice `orders`. Substitua o nome onde couber. Referência viva do padrão: `src/features/checkouts/`.

## 1. Estrutura

```
src/features/orders/
├── api/orders.api.ts
├── api/orders.queries.ts
├── components/
├── hooks/
├── types/order.ts
└── index.ts
```

## 2. Tipos — `types/order.ts`

Contratos do domínio, espelhando o backend. Union de status como `type`, entidades como `interface`, e inputs separados (`CreateOrderInput`, `UpdateOrderInput`).

## 3. Fetchers — `api/orders.api.ts`

Uma função por endpoint, sem React, já desembrulhando `ApiResponse` / `PaginatedResponse`:

```ts
export async function listOrders(params: ListOrdersParams = {}) {
  const response = await httpClient.get<PaginatedResponse<Order>>("/orders", { params });
  return response.data;
}
```

## 4. Keys + queryOptions — `api/orders.queries.ts`

`orderKeys` (factory hierárquica) e `orderQueries` com `queryOptions`. Detalhes e regras de invalidação em [data-fetching.md](data-fetching.md).

## 5. Hooks — `hooks/use-orders.ts`

Um hook por caso de uso, devolvendo objeto com nomes explícitos (`orders`, `isLoadingOrders`, `hasOrdersError`).

## 6. Componentes — `components/`

UI do domínio. Estados de carregando / erro / vazio ficam no componente de lista, não na rota.

## 7. Barrel — `index.ts`

Exporte só o que outras camadas podem usar: componentes públicos, hooks, `orderQueries`/`orderKeys` e os tipos.

```ts
export { OrderList } from "./components/order-list";
export { orderKeys, orderQueries } from "./api/orders.queries";
export { useOrders } from "./hooks/use-orders";
export type { Order, OrderStatus } from "./types/order";
```

## 8. Rota

`src/routes/orders/index.tsx` com `loader` prefetchando via `orderQueries`, importando **do barrel** (`@/features/orders`). Depois rode `pnpm routes:generate`.

## 9. Fechar

```bash
pnpm lint:fix && pnpm lint && pnpm build
git commit -m "feat(orders): adiciona listagem de pedidos"
```

## Checklist

- [ ] Nenhum import de arquivo interno de outra feature
- [ ] Nenhum `httpClient` fora de `api/*.api.ts`
- [ ] `queryOptions` reusado por hook **e** loader
- [ ] Mutation invalidando a key certa
- [ ] Barrel expondo só a API pública
- [ ] Sem `any`, textos de UI em pt-BR
- [ ] `pnpm lint` e `pnpm build` limpos
