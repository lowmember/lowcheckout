# Data fetching (TanStack Query)

## Camadas

```
component / route  →  hook (use-*.ts)  →  queryOptions (*.queries.ts)  →  fetcher (*.api.ts)  →  httpClient
```

Cada nível só conhece o de baixo. Componente nunca chama `httpClient`.

## Defaults globais

Definidos em `src/app/query-client.ts`:

| Opção | Valor | Efeito |
| --- | --- | --- |
| `staleTime` | 60s | não refaz request a cada mount dentro da janela |
| `gcTime` | 5min | tempo em cache após ficar sem observadores |
| `retry` | 1 (queries) / 0 (mutations) | evita repetir mutation não idempotente |
| `refetchOnWindowFocus` | `false` | sem refetch ao voltar para a aba |

Sobrescreva pontualmente no `queryOptions` da query, não no client global.

## 1. Fetcher — `*.api.ts`

Função pura, sem React, que já desembrulha o envelope da API (`ApiResponse<T>` / `PaginatedResponse<T>` em `@/shared/api`):

```ts
export async function getCheckout(checkoutId: string) {
  const response = await httpClient.get<ApiResponse<Checkout>>(`/checkouts/${checkoutId}`);
  return response.data.data;
}
```

## 2. Keys + queryOptions — `*.queries.ts`

Key factory hierárquica: cada nível deriva do anterior, o que permite invalidar do mais amplo ao mais específico.

```ts
export const checkoutKeys = {
  all: ["checkouts"] as const,
  lists: () => [...checkoutKeys.all, "list"] as const,
  list: (params: ListCheckoutsParams) => [...checkoutKeys.lists(), params] as const,
  details: () => [...checkoutKeys.all, "detail"] as const,
  detail: (checkoutId: string) => [...checkoutKeys.details(), checkoutId] as const,
};

export const checkoutQueries = {
  detail: (checkoutId: string) =>
    queryOptions({
      queryKey: checkoutKeys.detail(checkoutId),
      queryFn: () => getCheckout(checkoutId),
    }),
};
```

`queryOptions()` (e não um objeto solto) é o que dá inferência de tipo ponta a ponta e permite reusar a mesma definição em hook e loader.

## 3. Hook — `hooks/use-*.ts`

```ts
export function useCheckout(checkoutId: string) {
  const { data, isLoading, isError } = useQuery(checkoutQueries.detail(checkoutId));

  return { checkout: data, isLoadingCheckout: isLoading, hasCheckoutError: isError };
}
```

## 4. Prefetch na rota

O `loader` usa **o mesmo** `queryOptions`, então o hook do componente encontra o dado já em cache — sem waterfall e sem flash de loading:

```ts
export const Route = createFileRoute("/checkouts/$checkoutId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(checkoutQueries.detail(params.checkoutId)),
  component: CheckoutDetailsPage,
});
```

`ensureQueryData` usa o cache se estiver fresco; `context.queryClient` vem do contexto do router (`src/app/router.tsx`).

## Mutations

Ficam em `hooks/use-<verbo>-<entidade>.ts`, invalidando o nível mais alto que faz sentido:

```ts
const { mutateAsync, isPending } = useMutation({
  mutationFn: (input: CreateCheckoutInput) => createCheckout(input),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: checkoutKeys.lists() });
  },
});

return { createCheckout: mutateAsync, isCreatingCheckout: isPending };
```

Regras de invalidação:

- criou/removeu item → `checkoutKeys.lists()`
- editou um item → `checkoutKeys.detail(id)` **e** `checkoutKeys.lists()`
- nunca invalide `checkoutKeys.all` "por garantia": derruba cache que não precisava.

## Erros e auth

`src/shared/api/http-client.ts` injeta `Authorization: Bearer <access_token>` do `localStorage` e limpa o token em respostas 401. Erros de rede sobem como `AxiosError` — trate por estado do hook (`isError`), não com `try/catch` no componente.

## Devtools

`ReactQueryDevtools` (canto inferior esquerdo) e `TanStackRouterDevtools` (inferior direito) só aparecem em dev.
