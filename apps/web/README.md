# LowCheckout — Web

Aplicação de gerenciamento de checkouts.

## Stack

| Camada | Ferramenta |
| --- | --- |
| Build/dev | Vite 8 + React 19 (`@vitejs/plugin-react-swc`) |
| Linguagem | TypeScript 6 (strict) |
| Lint/Format | Biome 2 |
| Server state | TanStack Query 5 |
| Rotas | TanStack Router (file-based) |
| Estilo | Tailwind CSS 4 |
| HTTP | Axios |
| Git hooks | Lefthook + commitlint (Conventional Commits) |

## Começando

```bash
pnpm install          # instala deps e os git hooks (script prepare)
cp .env.example .env.local
pnpm dev              # http://localhost:5173
```

## Scripts

```bash
pnpm dev              # servidor de desenvolvimento
pnpm build            # gera rotas, checa tipos e builda
pnpm preview          # serve o build de produção
pnpm lint             # biome check (lint + format + imports)
pnpm lint:fix         # biome check --write
pnpm format           # biome format --write
pnpm typecheck        # tsc -b --noEmit
pnpm routes:generate  # regenera src/routeTree.gen.ts
```

## Estrutura

```
src/
├── app/       composition root: providers, query client, router
├── routes/    file-based routing → src/routeTree.gen.ts (gerado)
├── features/  slices de domínio (api/ hooks/ components/ types/ + index.ts)
├── shared/    infra reutilizável: api/ config/ lib/ ui/
└── styles/    global.css (entrada do Tailwind)
```

Direção de dependência: `routes → features → shared`. O slice `src/features/checkouts` é a referência viva do padrão — ele aponta para endpoints que o backend ainda precisa expor (`GET/POST /checkouts`, `GET/PATCH/DELETE /checkouts/:id`).

## Documentação

- [docs/architecture.md](docs/architecture.md) — camadas, anatomia de um slice, onde cada arquivo mora
- [docs/conventions.md](docs/conventions.md) — nomes, TypeScript, hooks, ordem de imports, estilo
- [docs/data-fetching.md](docs/data-fetching.md) — TanStack Query: keys, `queryOptions`, loaders, invalidação
- [docs/routing.md](docs/routing.md) — TanStack Router file-based, params, contexto
- [docs/adding-a-feature.md](docs/adding-a-feature.md) — receita passo a passo com checklist
- [docs/tooling.md](docs/tooling.md) — Biome, lefthook, env, TypeScript, notas de build

Agentes de IA começam por [CLAUDE.md](CLAUDE.md).
