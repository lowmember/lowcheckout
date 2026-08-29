# LowCheckout API

API serverless de checkouts. Node 24 (LTS) + TypeScript 7 + Serverless Framework v4 (AWS Lambda `nodejs24.x`, arm64, HTTP API), Drizzle ORM sobre Postgres (Neon em produção, Docker local), Biome, pnpm.

## Comandos

```bash
pnpm db:up        # sobe o Postgres local (volume nomeado, dados persistem)
pnpm db:migrate   # aplica as migrations de drizzle/
pnpm dev          # serverless offline em http://localhost:3333 (é a URL que o ../web espera)
pnpm lint         # biome check .        → SEMPRE rodar antes de encerrar uma task
pnpm lint:fix     # biome check --write .
pnpm typecheck    # tsc --noEmit
pnpm package      # build do artefato (esbuild, ESM) sem deploy
pnpm exec serverless print   # imprime a config resolvida — útil para conferir as rotas derivadas
```

`pnpm lint`, `pnpm typecheck` e `pnpm package` são o critério de "pronto". Não existe suíte de testes ainda — não invente scripts de teste.

## Arquitetura — Clean Architecture + DDD

```
src/domain/        entidades, value objects, erros de negócio e PORTAS de repositório
src/application/   casos de uso + portas de infra (Clock, IdGenerator, Logger) e DTOs
src/presentation/  controllers, HttpRequest/HttpResponse próprios, portas Validator e
                   HttpRouteRegistry, e a tabela de rotas (routes/http-routes.ts)
src/infra/         adapters: Drizzle, zod, AWS Lambda, console logger, composition root (di/)
```

Dependências apontam **para dentro**: `infra → presentation → application → domain`. O domínio não importa nada de fora dele.

## Nomenclatura: o papel aparece no import

Todo símbolo carrega o sufixo do seu papel — nunca se importa um `CreateCheckout` solto.

| Papel | Porta (interface) | Implementação |
| --- | --- | --- |
| Caso de uso | `CreateCheckoutUseCase` | `DefaultCreateCheckoutUseCase` |
| Repositório | `CheckoutsRepository` (plural, como `UsersRepository`) | `DrizzleCheckoutsRepository` |
| Controller | `Controller` | `CreateCheckoutController` |
| Validação | `Validator<T>` | `ZodValidator` |
| Registry de rotas | `HttpRouteRegistry` | `InMemoryHttpRouteRegistry` |
| Relógio / ID / Log | `Clock`, `IdGenerator`, `Logger` | `SystemClock`, `CryptoIdGenerator`, `ConsoleLogger` |

A porta fica com o nome do papel; a implementação ganha um prefixo que diz **como** ela resolve (`Drizzle`, `Zod`, `InMemory`, `System`) — ou `Default` quando existe uma implementação só, como nos casos de uso. Campos e parâmetros seguem o tipo: `private readonly createCheckoutUseCase: CreateCheckoutUseCase`.

Exceção deliberada: **entidades e value objects não levam sufixo**. São `Checkout`, `Money`, `Slug` — o substantivo da linguagem ubíqua, não um papel técnico.

## Regras inegociáveis

1. **Nenhuma camada acima de `infra/` importa biblioteca de terceiros.** `zod` só existe em `infra/validation/zod`, `drizzle-orm` só em `infra/persistence/drizzle`, tipos `aws-lambda` só em `infra/http/lambda`. Precisa de uma lib numa camada interna? Crie uma porta e implemente o adapter na infra.
2. **Dependency Inversion sempre por construtor.** Classes recebem *interfaces*, nunca instanciam colaboradores. Quem amarra concreto a porta é `src/infra/di/` — e só ele.
3. **A entidade nunca vaza.** Casos de uso devolvem DTOs (`toCheckoutDto`); controllers e adapters nunca veem `Checkout`.
4. **Invariante de negócio mora no domínio** (value object ou entidade), não no schema do zod. O zod valida *formato de entrada*; o domínio valida *regra*.
5. **Erros**: domínio lança `DomainError`; a tradução para status HTTP é exclusividade do `ErrorHandlingController`. Controller não tem `try/catch`.
6. **Imports sempre por `@/`** — nada de `../../..`. O Biome ordena e separa os blocos; não organize na mão.
7. **Env só via `@/infra/config/env`** — nunca `process.env` espalhado.
8. **Commits em Conventional Commits** (`feat(checkouts): ...`) — o hook `commit-msg` rejeita o resto.
9. **Nada de `any`** (`noExplicitAny` é erro).
10. **Sufixo de papel em todo símbolo importável** — ver a tabela acima. Um import de `CreateCheckout` sem sufixo é bug de nomenclatura.

## Rotas: uma declaração só

Método e caminho vivem em `presentation/http/routes/http-routes.ts`. A partir dali:

- `infra/di/factories/http-route-registry.factory.ts` liga cada rota ao seu controller (é o único lugar que conhece os dois lados);
- `infra/http/lambda/lambda-route.adapter.ts` resolve a rota pelo nome e adapta o controller ao evento da AWS;
- `infra/http/lambda/lambda-functions.ts` deriva o bloco `functions`, que o `serverless.ts` consome.

Consequência: não existe caminho HTTP escrito duas vezes, e `adaptLambdaRoute("naoExiste")` não compila.

## Adicionando um endpoint

1. Regra nova? Entidade/VO em `domain/`.
2. Caso de uso em `application/<contexto>/use-cases/` (interface + classe), recebendo portas por construtor.
3. Controller em `presentation/http/controllers/`, dependendo da interface do caso de uso e de `Validator`.
4. Declare a rota em `presentation/http/routes/http-routes.ts`.
5. Schema zod em `infra/validation/zod/schemas/`, factory do controller em `infra/di/factories/` e o binding em `http-route-registry.factory.ts`.
6. Crie `infra/http/lambda/handlers/<nome-da-rota-em-kebab-case>.ts` com `export const handler = adaptLambdaRoute("<nomeDaRota>")`. O `serverless.ts` pega a função sozinho — o nome do arquivo segue a convenção kebab-case e não é opcional.

## Banco de dados

Local: `docker-compose.yml` sobe `postgres:18-alpine` no volume nomeado `lowcheckout-postgres-data` — sobrevive a `docker compose down` e a reinicializações; só `pnpm db:reset` (`down -v`) apaga.
Produção: Neon. Use a connection string **pooled** (`...-pooler...?sslmode=require`); o driver já roda com `prepare: false`, exigência do PgBouncer em transaction mode.

Mudou o schema em `infra/persistence/drizzle/schema/`? `pnpm db:generate` gera o SQL em `drizzle/` (commite) e `pnpm db:migrate` aplica.

## Armadilhas conhecidas

- A configuração é `serverless.ts` (não `.yml`), porque o bloco `functions` é derivado das rotas. O loader do Serverless resolve o alias `@/`. Em `serverless.ts` a regra `noTemplateCurlyInString` do Biome fica desligada por override: `${env:...}` ali é sintaxe de variável do Serverless, não template string.
- O `docker-compose.yml` declara `name: lowcheckout` de propósito: sem isso o Compose usaria o nome do diretório (`api`), que colide com outras stacks locais.
- O script `prepare` é `lefthook install || true` porque o Serverless roda `pnpm install` no diretório de build, onde não há git nem lefthook — sem o `|| true` o `serverless package` quebra.
- O lefthook não roda antes do commit inicial do repositório (não há `HEAD`). Só nesse primeiro commit use `git commit --no-verify`.
- Serverless Framework v4 exige `SERVERLESS_ACCESS_KEY` (licença gratuita até US$ 2M de receita) para `deploy`/`package` em CI.
