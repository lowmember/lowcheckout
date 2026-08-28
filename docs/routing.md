# Rotas (TanStack Router)

Roteamento **file-based**: cada arquivo em `src/routes/` vira uma rota, e o plugin do Vite gera `src/routeTree.gen.ts`.

## Convenções de arquivo

| Arquivo | URL |
| --- | --- |
| `routes/__root.tsx` | layout raiz (nav + `<Outlet />`), envolve tudo |
| `routes/index.tsx` | `/` |
| `routes/checkouts/index.tsx` | `/checkouts` |
| `routes/checkouts/$checkoutId.tsx` | `/checkouts/:checkoutId` |
| `routes/_layout.tsx` + `routes/_layout/x.tsx` | layout sem segmento na URL (pathless) |
| `routes/-componente.tsx` | ignorado pelo gerador (prefixo `-`) |

`src/routeTree.gen.ts` é **gerado**: nunca edite, nunca revise à mão. Rode `pnpm routes:generate` após criar ou renomear rotas (o `pnpm dev` e o `pnpm build` também regeneram).

## Esqueleto de uma rota

```tsx
export const Route = createFileRoute("/checkouts/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(checkoutQueries.list()),
  component: CheckoutsPage,
});

function CheckoutsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Checkouts" description="Todos os checkouts da sua conta." />
      <CheckoutList />
    </div>
  );
}
```

A rota é fina: `loader` + composição. Regra de negócio e fetching moram na feature.

## Params

```tsx
const { checkoutId } = Route.useParams();          // tipado a partir do nome do arquivo
const { status } = Route.useSearch();              // search params, se declarados
```

## Contexto

`src/app/router.tsx` injeta `{ queryClient }` no contexto, tipado em `__root.tsx` por `createRootRouteWithContext<RouterContext>()`. É assim que os `loader`s prefetcham (ver [data-fetching.md](data-fetching.md)).

## Navegação

```tsx
<Link to="/checkouts/$checkoutId" params={{ checkoutId: checkout.id }}>{checkout.name}</Link>
```

`to` e `params` são checados em tempo de compilação — se a URL não existir na árvore de rotas, o build quebra. Não monte href com template string.

## Configuração

- `defaultPreload: "intent"` — prefetch ao passar o mouse/focar no link.
- `autoCodeSplitting: true` — cada rota vira um chunk próprio automaticamente.
- Alteração de config do gerador precisa ser espelhada em **dois** lugares: `vite.config.ts` (plugin, usado no dev/build) e `tsr.config.json` (CLI, usado por `pnpm routes:generate`).
