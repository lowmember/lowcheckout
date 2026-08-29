# LowCheckout Web

SPA de gerenciamento de checkouts. React 19 + Vite 8 + TypeScript 6 (strict), TanStack Query/Router, Tailwind 4, Biome, pnpm.

## Comandos

```bash
pnpm dev          # http://localhost:5173  (porta 3000 está ocupada por outro serviço da máquina)
pnpm lint         # biome check .          → SEMPRE rodar antes de encerrar uma task
pnpm lint:fix     # biome check --write .  → corrige formatação, lint e ordem de imports
pnpm typecheck    # tsc -b --noEmit
pnpm build        # tsr generate && tsc -b && vite build
```

`pnpm lint` e `pnpm build` são o critério de "pronto". Não existe suíte de testes ainda — não invente scripts de teste.

## Mapa do código

```
src/app/       composition root: providers, queryClient, router   (ninguém importa daqui, exceto main.tsx)
src/routes/    file-based routing → gera src/routeTree.gen.ts     (arquivo gerado, NUNCA editar)
src/features/  slices de domínio: api/ hooks/ components/ types/ + index.ts (barrel)
src/shared/    infra sem regra de negócio: api/ config/ lib/ ui/
src/styles/    global.css (entrada do Tailwind)
```

## Regras inegociáveis

1. **Direção de dependência**: `routes → features → shared`. Nunca o inverso.
2. **Features não se enxergam por dentro**: importe outra feature só pelo barrel (`@/features/x`). Se duas features precisam da mesma coisa, promova para `shared/`.
3. **Imports sempre por `@/`** — nada de `../../..`. O Biome ordena e separa os blocos; não organize na mão.
4. **Env só via `@/shared/config/env`** — nunca `import.meta.env` espalhado.
5. **HTTP só via `httpClient`** (`@/shared/api`) dentro de `features/*/api/*.api.ts`. Componentes não chamam axios.
6. **Query keys e `queryOptions`** ficam em `features/*/api/*.queries.ts` e são reusados por hooks e loaders de rota.
7. **Commits em Conventional Commits** (`feat(checkouts): ...`) — o hook `commit-msg` rejeita o resto.
8. **Nada de `any`** (`noExplicitAny` é erro) e textos de UI em pt-BR.

## Antes de mexer, leia o doc certo

Leia sob demanda — não carregue tudo de uma vez.

| Vou... | Leia |
| --- | --- |
| criar/editar uma feature inteira, do zero ao fim | [docs/adding-a-feature.md](docs/adding-a-feature.md) |
| decidir onde um arquivo mora, ou mexer em camadas | [docs/architecture.md](docs/architecture.md) |
| nomear arquivos, hooks, tipos; dúvida de estilo | [docs/conventions.md](docs/conventions.md) |
| buscar/mutar dados, cache, invalidação | [docs/data-fetching.md](docs/data-fetching.md) |
| criar rota, param, loader, layout | [docs/routing.md](docs/routing.md) |
| configurar Biome, hooks de git, env, build | [docs/tooling.md](docs/tooling.md) |

## Armadilhas conhecidas

- `src/routeTree.gen.ts` é gerado por `pnpm routes:generate` (e pelo plugin no dev/build). Rode-o após criar/renomear rotas; nunca edite o arquivo.
- TypeScript 6 depreciou `baseUrl`: o alias `@/*` vive em `paths` (tsconfig.app.json) + `resolve.alias` (vite.config.ts). Precisa mexer nos dois.
- O repositório ainda não tem commit inicial; o lefthook falha antes do primeiro commit. Use `git commit --no-verify` só nele.
