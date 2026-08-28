# Ferramentas e configuração

## Scripts

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Vite em `http://localhost:5173` |
| `pnpm build` | `tsr generate && tsc -b && vite build` |
| `pnpm preview` | serve o build de produção |
| `pnpm lint` | `biome check .` (lint + formatação + imports) |
| `pnpm lint:fix` | `biome check --write .` |
| `pnpm format` | só formatação |
| `pnpm typecheck` | `tsc -b --noEmit` |
| `pnpm routes:generate` | regenera `src/routeTree.gen.ts` |

A porta é 5173 porque **3000 já está ocupada** por outro serviço na máquina de dev.

## Biome (`biome.json`)

Substitui ESLint + Prettier. Aspas duplas, ponto e vírgula, vírgula final, 2 espaços, linha de 100 colunas. Ignora `dist/`, `public/` e `src/routeTree.gen.ts`.

Regras endurecidas além do preset `recommended`: `noExplicitAny`, `noUnusedImports`, `noUnusedVariables`, `useImportType`, `useConst` (erro); `useExhaustiveDependencies`, `noNonNullAssertion` (aviso).

O assist `organizeImports` separa os imports em blocos com linha em branco (node → pacotes → `@/` → relativos → estilos). Dois detalhes que fazem isso funcionar: `sortBareImports: true` (sem ele, imports de efeito colateral como o CSS não são movidos) e o negador `"!**/*.css"` nos grupos anteriores, que impede o `global.css` de ser capturado pelo grupo `:ALIAS:` antes de chegar em `:STYLE:`.

CSS: `css.parser.tailwindDirectives` precisa ficar ligado, senão o Biome não parseia `@theme` do Tailwind 4.

## Git hooks (lefthook)

Instalados pelo script `prepare` a cada `pnpm install`, ou via `pnpm exec lefthook install`.

| Hook | Ação |
| --- | --- |
| `pre-commit` | `biome check --write` nos arquivos staged + re-stage do corrigido (`stage_fixed: true`) |
| `commit-msg` | `commitlint` com preset Conventional Commits |

Erro que o Biome não corrige sozinho (ex.: `any`) aborta o commit. Tipos aceitos na mensagem: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert` (`commitlint.config.js`).

O lefthook não roda antes do commit inicial do repositório (ele tenta `git stash create` e não há `HEAD`) — só nesse primeiro commit use `git commit --no-verify`.

## Variáveis de ambiente

`.env.example` → copie para `.env.local`. Hoje só `VITE_API_URL`.

Para adicionar uma variável: declare em `src/vite-env.d.ts` (`ImportMetaEnv`), exponha em `src/shared/config/env.ts` (use `required()` se for obrigatória — falha no boot em vez de gerar `undefined` silencioso) e registre em `.env.example`. Nunca leia `import.meta.env` fora de `env.ts`.

## TypeScript

Projeto em modo composite: `tsconfig.app.json` (código, DOM, `strict`) e `tsconfig.node.json` (`vite.config.ts`).

O alias `@/*` precisa estar sincronizado em **dois** arquivos: `paths` no `tsconfig.app.json` e `resolve.alias` no `vite.config.ts`. TypeScript 6 depreciou `baseUrl` — não reintroduza, `paths` já resolve relativo ao tsconfig.

## Notas de build

- Vite 8 roda sobre Rolldown e emite um aviso sugerindo `@vitejs/plugin-react` (Oxc) no lugar do `@vitejs/plugin-react-swc`. A escolha pelo SWC foi deliberada; a troca, se um dia interessar, é de uma linha no `vite.config.ts`.
- pnpm bloqueia scripts de instalação por padrão: `@biomejs/biome`, `@swc/core`, `esbuild` e `lefthook` estão liberados em `pnpm.onlyBuiltDependencies` no `package.json`. Nova dependência com binário precisa entrar nessa lista.
