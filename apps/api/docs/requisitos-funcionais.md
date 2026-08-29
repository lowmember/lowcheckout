# LowCheckout — Requisitos Funcionais

## Propósito

Este documento traduz o blueprint do produto em requisitos funcionais numerados e verificáveis, no nível de **comportamento observável**. Serve de insumo para as etapas seguintes (modelagem de entidades, casos de uso, contratos HTTP, telas). Não define schema, endpoints nem implementação.

## Escopo

Cobre os 8 módulos do blueprint — Autenticação, Onboarding, Produto, Oferta, Checkout (builder e tracking), Página pública (fluxo do comprador), Pedido/Pagamento PIX, Gateway, Analytics e Configurações da conta — incluindo itens marcados como pós-MVP, que aparecem aqui com prioridade `Pós-MVP` em vez de omitidos.

Fora de escopo: monetização/cobrança do próprio LowCheckout (não decidida), painel do comprador (o produto não terá), processamento de pagamento próprio (o produto é *checkout as a service*; quem processa é o gateway do usuário).

## Fonte da verdade

> A fonte da verdade do produto é `lowcheckout-blueprint.md`. Onde este documento for além do blueprint, o trecho está marcado com `> ⚠️ Suposição:` e replicado na seção **Ambiguidades e decisões pendentes**. Em caso de conflito, o blueprint vence e este documento deve ser corrigido.

## Divergência conhecida entre código atual e blueprint

O scaffold atual da API (`api/src/domain/checkouts/`, `api/src/infra/persistence/drizzle/schema/checkouts.table.ts`) modela **preço no checkout** (`price_in_cents`, `currency`, além do value object `Money` dentro da entidade `Checkout`). Isso **contradiz o blueprint**: preço é atributo da **Oferta** (módulo 3), e o checkout apenas expõe N ofertas. O scaffold também não tem noção de conta/tenant, produto nem oferta, e usa `status` (`draft | active | paused | archived`) que o blueprint não menciona. Os requisitos abaixo seguem o blueprint; o código atual deve ser refatorado para acompanhá-los.

## Glossário de atores

| Ator | Quem é |
| --- | --- |
| Usuário autenticado | Dono/operador de uma conta LowCheckout, logado via Google |
| Comprador anônimo | Visitante da página pública de checkout; não tem conta nem login |
| Sistema | Rotinas internas (expiração, agregação de métricas, envio de e-mail, fallbacks) |
| Webhook do gateway | Chamada de entrada assíncrona do provedor de pagamento (EfiBank) |

---

## Tabela-resumo

| Código | Módulo | Resumo | Prioridade |
| --- | --- | --- | --- |
| RF-AUTH-01 | AUTH | Login exclusivamente via Google | MVP |
| RF-AUTH-02 | AUTH | Provisionar conta e usuário no primeiro login | MVP |
| RF-AUTH-03 | AUTH | Sessão autenticada e proteção das áreas do painel | MVP |
| RF-AUTH-04 | AUTH | Encerrar sessão (logout) | MVP |
| RF-ONB-01 | ONB | Onboarding bloqueante após o primeiro login | MVP |
| RF-ONB-02 | ONB | Coletar dados obrigatórios e opcionais da conta | MVP |
| RF-ONB-03 | ONB | Tutorial guiado pós-onboarding | Pós-MVP |
| RF-PROD-01 | PROD | Criar produto | MVP |
| RF-PROD-02 | PROD | Listar produtos da conta | MVP |
| RF-PROD-03 | PROD | Editar produto | MVP |
| RF-PROD-04 | PROD | Excluir produto | Pós-MVP |
| RF-OFER-01 | OFER | Criar oferta vinculada a um produto | MVP |
| RF-OFER-02 | OFER | Fallback da URL do entregável para o produto | MVP |
| RF-OFER-03 | OFER | Editar oferta | MVP |
| RF-OFER-04 | OFER | Excluir oferta | Pós-MVP |
| RF-OFER-05 | OFER | Reuso do produto e não propagação automática de ofertas | MVP |
| RF-CHK-01 | CHK | Criar checkout vinculado a um produto | MVP |
| RF-CHK-02 | CHK | Listar checkouts da conta | MVP |
| RF-CHK-03 | CHK | Editar dados de identidade do checkout | MVP |
| RF-CHK-04 | CHK | Excluir checkout | Pós-MVP |
| RF-CHK-05 | CHK | Vincular e desvincular ofertas do checkout (1 URL pública por oferta) | MVP |
| RF-CHK-06 | CHK | Página interna do checkout com as quatro áreas | MVP |
| RF-CHK-07 | CHK | Builder — customização manual por campos | MVP |
| RF-CHK-08 | CHK | Builder — customização via JSON com importação e sobrescrita confirmada | MVP |
| RF-CHK-09 | CHK | Builder — preview lado a lado com toggle desktop/mobile | MVP |
| RF-CHK-10 | CHK | Tracking/pixels por checkout (Facebook, Utmify) | MVP |
| RF-CHK-11 | CHK | Gerar JSON de customização via IA a partir do contexto do produto | Pós-MVP |
| RF-PUB-01 | PUB | Servir a página pública de uma oferta pela sua URL | MVP |
| RF-PUB-02 | PUB | Coletar nome, e-mail e CPF do comprador | MVP |
| RF-PUB-03 | PUB | Gerar cobrança PIX a partir do formulário | MVP |
| RF-PUB-04 | PUB | Tela do PIX com QR Code, copia-e-cola e timer | MVP |
| RF-PUB-05 | PUB | Atualização automática do status do pagamento | MVP |
| RF-PUB-06 | PUB | Tela de obrigado com acesso ao entregável | MVP |
| RF-PUB-07 | PUB | Lembrança dos dados do comprador em compras futuras | Pós-MVP |
| RF-PUB-08 | PUB | Disparar eventos de tracking ao longo do fluxo público | MVP |
| RF-PAG-01 | PAG | Criar pedido no envio do formulário | MVP |
| RF-PAG-02 | PAG | Ciclo de vida do pedido (aguardando_pagamento → pago \| expirado) | MVP |
| RF-PAG-03 | PAG | Expirar pedido não pago no fim do prazo do PIX | MVP |
| RF-PAG-04 | PAG | Confirmar pagamento a partir do webhook | MVP |
| RF-PAG-05 | PAG | Enviar entregável por e-mail após aprovação | MVP |
| RF-PAG-06 | PAG | Congelar os dados comerciais no pedido | MVP |
| RF-GTW-01 | GTW | Conectar gateway a nível de conta (EfiBank PIX) | MVP |
| RF-GTW-02 | GTW | Receber e processar webhook do gateway de forma idempotente | MVP |
| RF-GTW-03 | GTW | Herança do gateway por todos os checkouts da conta | MVP |
| RF-GTW-04 | GTW | Editar credenciais e desconectar o gateway | MVP |
| RF-GTW-05 | GTW | Validar credenciais no momento da conexão | MVP |
| RF-GTW-06 | GTW | Suporte a múltiplos providers de gateway | Pós-MVP |
| RF-ANL-01 | ANL | Seletor de período único controlando a home | MVP |
| RF-ANL-02 | ANL | Faturamento e ticket médio do período | MVP |
| RF-ANL-03 | ANL | Cards de vendas aprovadas, pendentes e expiradas | MVP |
| RF-ANL-04 | ANL | Gráfico de vendas ao longo do período | MVP |
| RF-ANL-05 | ANL | Ranking dos checkouts por faturamento | MVP |
| RF-ANL-06 | ANL | Funil, conversão e abandono do PIX dentro do checkout | Pós-MVP |
| RF-CONF-01 | CONF | Editar nome e e-mail da conta | Pós-MVP |
| RF-CONF-02 | CONF | CPF/CNPJ bloqueado para edição | Pós-MVP |
| RF-CONF-03 | CONF | Desativar conta | Pós-MVP |
| RF-CONF-04 | CONF | Deletar conta | Pós-MVP |

---

## AUTH — Autenticação

### RF-AUTH-01 — Login exclusivamente via Google

**Descrição** — O sistema deve autenticar o usuário exclusivamente pelo login social do Google, sem oferecer cadastro ou acesso por e-mail e senha.

**Ator** — Usuário autenticado (em processo de autenticação).

**Critérios de aceite**
- Dado um visitante não autenticado na tela de acesso, Quando ele aciona "Entrar com Google", Então é redirecionado ao consentimento do Google e retorna autenticado ao painel.
- Dado um visitante na tela de acesso, Quando a tela é exibida, Então não há campos de e-mail/senha nem link de "esqueci minha senha".
- Dado um usuário que cancela o consentimento no Google, Quando retorna à aplicação, Então permanece não autenticado e recebe mensagem de falha, sem conta criada.
- Dado um retorno do Google sem e-mail verificado, Quando o sistema processa o login, Então o acesso é recusado.

**Regras de negócio**
- Único provedor de identidade: Google. Não existe fluxo de recuperação de senha porque não existe senha.
- Identificador natural do usuário: e-mail do Google (obrigatório e verificado). Nome e foto vindos do Google são opcionais.
- Um mesmo e-mail Google corresponde sempre ao mesmo usuário; segundo login não cria registro novo.

**Prioridade** — MVP

### RF-AUTH-02 — Provisionar conta e usuário no primeiro login

**Descrição** — O sistema deve, no primeiro login de um e-mail ainda desconhecido, criar o usuário e a conta (tenant) à qual todos os dados dele passam a pertencer.

**Ator** — Sistema.

**Critérios de aceite**
- Dado um e-mail Google que nunca acessou o produto, Quando o login é concluído, Então são criados um usuário e uma conta associada, e o usuário é enviado ao onboarding (RF-ONB-01).
- Dado um e-mail já conhecido, Quando o login é concluído, Então nenhuma conta nova é criada e o usuário é levado ao painel (ou ao onboarding, se ainda pendente).
- Dado um usuário autenticado, Quando ele consulta ou grava qualquer recurso (produto, oferta, checkout, pedido, gateway), Então a operação é resolvida no contexto da conta dele.

**Regras de negócio**
- Cardinalidade: uma conta tem 1..N usuários; um usuário pertence a exatamente 1 conta. No MVP a relação é 1:1 — não há convite de membros.
- Conta é a fronteira de isolamento de dados: produtos, ofertas, checkouts, pedidos, gateway, pixels e métricas pertencem a uma conta.
- Conta recém-criada nasce com onboarding pendente.

> ⚠️ Suposição: o blueprint fala em "conta" (gateway "a nível de conta", "Configurações da conta") mas não descreve como ela é criada nem se comporta múltiplos usuários. Assumido: provisionamento automático no primeiro login, 1 usuário por conta no MVP.

**Prioridade** — MVP

### RF-AUTH-03 — Sessão autenticada e proteção das áreas do painel

**Descrição** — O sistema deve manter a sessão do usuário autenticado e recusar acesso às áreas do painel a quem não estiver autenticado.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um visitante não autenticado, Quando acessa qualquer rota do painel, Então é redirecionado à tela de acesso.
- Dado um usuário autenticado, Quando recarrega a aplicação, Então continua autenticado sem refazer o consentimento do Google, enquanto a sessão for válida.
- Dado uma sessão expirada, Quando o usuário faz qualquer ação no painel, Então ele é levado à tela de acesso com aviso de sessão encerrada.
- Dado um usuário autenticado da conta A, Quando tenta acessar um recurso da conta B por identificador direto, Então o sistema responde como recurso inexistente.

**Regras de negócio**
- A página pública de checkout (módulo PUB) é a única área que **não** exige sessão.
- Nenhuma resposta pode revelar a existência de recurso de outra conta.

**Prioridade** — MVP

### RF-AUTH-04 — Encerrar sessão (logout)

**Descrição** — O sistema deve permitir que o usuário encerre a própria sessão a qualquer momento.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um usuário autenticado, Quando aciona "Sair", Então a sessão é invalidada e ele volta à tela de acesso.
- Dado um usuário que acabou de sair, Quando aciona "voltar" no navegador, Então não obtém acesso a dados do painel.

**Regras de negócio**
- Logout invalida a sessão corrente; não remove dados nem desativa a conta.

**Prioridade** — MVP

---

## ONB — Onboarding da conta

### RF-ONB-01 — Onboarding bloqueante após o primeiro login

**Descrição** — O sistema deve bloquear o uso do painel até que o onboarding da conta seja concluído.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um usuário com onboarding pendente, Quando acessa qualquer rota do painel, Então é redirecionado ao formulário de onboarding.
- Dado um usuário no onboarding, Quando envia o formulário com todos os obrigatórios válidos, Então a conta passa a "onboarding concluído" e ele é levado à home.
- Dado um usuário com onboarding pendente, Quando tenta criar produto, oferta, checkout ou conectar gateway, Então a ação é recusada.
- Dado um usuário com onboarding concluído, Quando faz login novamente, Então vai direto para a home.

**Regras de negócio**
- O onboarding é por **conta**, não por usuário, e ocorre uma única vez.
- Não há como pular ou adiar; não existe estado "parcialmente concluído" — ou os obrigatórios estão todos preenchidos, ou o onboarding continua pendente.

**Prioridade** — MVP

### RF-ONB-02 — Coletar dados obrigatórios e opcionais da conta

**Descrição** — O sistema deve coletar no onboarding os dados cadastrais da conta, distinguindo campos obrigatórios de opcionais.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado o formulário de onboarding, Quando o usuário envia sem nome do negócio, CPF/CNPJ ou telefone, Então o envio é recusado com erro no campo faltante.
- Dado um CPF ou CNPJ com dígitos verificadores inválidos, Quando o usuário envia, Então o envio é recusado com erro de documento inválido.
- Dado o formulário preenchido apenas com os obrigatórios, Quando é enviado, Então o onboarding é concluído com sucesso.
- Dado o usuário informando "o que vende" e "faturamento estimado", Quando envia, Então os valores são gravados na conta.

**Regras de negócio**
- Obrigatórios: **nome do negócio**, **CPF/CNPJ** (o tipo do documento é escolhido pelo usuário e determina a validação aplicada), **telefone**.
- Opcionais: **o que vende** e **faturamento estimado**, ambos de lista fechada de opções.
- Documento é normalizado para dígitos e deve ser único por conta.
- O CPF/CNPJ informado aqui fica bloqueado para edição posterior (RF-CONF-02).

> ⚠️ Suposição: a tela já implementada em `web/src/features/signup/` coleta tipo de documento, documento, telefone, tipo de produto e faixa de faturamento, mas **não** coleta "nome do negócio", que o blueprint lista como obrigatório. Assumido que o blueprint prevalece e o campo deve ser adicionado.

**Prioridade** — MVP

### RF-ONB-03 — Tutorial guiado pós-onboarding

**Descrição** — O sistema deve oferecer um tutorial guiado que conduza o usuário recém-onboardeado pelos primeiros passos do produto.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um usuário que acabou de concluir o onboarding, Quando entra na home pela primeira vez, Então o tutorial guiado é iniciado.
- Dado o tutorial em andamento, Quando o usuário o encerra ou o conclui, Então ele não é reaberto automaticamente nos acessos seguintes.

**Regras de negócio**
- Marcado no blueprint como "(Futuro)". Conteúdo, número de passos e possibilidade de reabrir o tutorial não estão definidos.

**Prioridade** — Pós-MVP

---

## PROD — Produto

### RF-PROD-01 — Criar produto

**Descrição** — O sistema deve permitir que o usuário cadastre um produto na sua conta.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado o formulário de produto, Quando o usuário informa o nome e envia, Então o produto é criado na conta dele.
- Dado o formulário sem nome, Quando é enviado, Então a criação é recusada com erro no campo.
- Dado um valor que não é URL válida em imagem ou entregável, Quando é enviado, Então a criação é recusada com erro no campo correspondente.
- Dado um produto recém-criado sem nenhuma oferta, Quando o usuário abre a lista de produtos, Então o produto aparece normalmente.

**Regras de negócio**
- Campos: **nome** (obrigatório), **descrição** (opcional), **URL da imagem** (opcional), **URL do entregável padrão** (opcional).
- URLs, quando informadas, devem ser absolutas e válidas.
- O produto sozinho não tem preço — preço pertence à oferta (RF-OFER-01).
- Produto pertence a exatamente uma conta; um produto tem 0..N ofertas e pode ser reutilizado em vários checkouts.

> ⚠️ Suposição: o blueprint não diz quais campos do produto além do nome são obrigatórios. Assumido: só o nome é obrigatório; "URL da imagem" e "URL do entregável (padrão)" são opcionais, sendo que a ausência da URL do entregável no produto torna-a obrigatória na oferta (RF-OFER-02).

**Prioridade** — MVP

### RF-PROD-02 — Listar produtos da conta

**Descrição** — O sistema deve listar os produtos da conta com informação suficiente para identificá-los e navegar até suas ofertas.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um usuário com produtos cadastrados, Quando abre a listagem, Então vê apenas os produtos da própria conta.
- Dado um usuário sem produtos, Quando abre a listagem, Então vê um estado vazio com chamada para criar o primeiro produto.
- Dado um produto na lista, Quando o usuário o seleciona, Então acessa seus detalhes e suas ofertas.

**Regras de negócio**
- A listagem é sempre escopada pela conta do usuário.
- Cada item exibe ao menos nome, imagem (quando houver) e quantidade de ofertas.

**Prioridade** — MVP

### RF-PROD-03 — Editar produto

**Descrição** — O sistema deve permitir alterar nome, descrição, URL da imagem e URL do entregável padrão de um produto existente.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um produto existente, Quando o usuário altera campos e salva, Então os novos valores passam a valer para as telas do painel e para as páginas públicas dos checkouts que o usam.
- Dado uma alteração da URL do entregável padrão, Quando existem ofertas sem entregável próprio, Então essas ofertas passam a resolver para a nova URL (RF-OFER-02).
- Dado um envio com nome vazio, Quando o usuário salva, Então a edição é recusada.

**Regras de negócio**
- Alterações de produto **não** retroagem sobre pedidos já criados, que guardam os dados congelados (RF-PAG-06).
- As mesmas validações de RF-PROD-01 se aplicam.

**Prioridade** — MVP

### RF-PROD-04 — Excluir produto

**Descrição** — O sistema deve permitir excluir um produto que não esteja em uso.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um produto sem ofertas e sem checkouts vinculados, Quando o usuário confirma a exclusão, Então o produto deixa de aparecer na listagem.
- Dado um produto com ofertas ou com checkout vinculado, Quando o usuário tenta excluí-lo, Então a exclusão é recusada com explicação do que precisa ser removido antes.
- Dado o diálogo de exclusão, Quando o usuário cancela, Então nada é alterado.

**Regras de negócio**
- Exclusão exige confirmação explícita.
- Produtos referenciados por pedidos históricos nunca podem ser removidos de forma que apague o histórico de vendas.

> ⚠️ Suposição: o blueprint não trata de exclusão de produto nem de exclusão lógica vs. física. Assumido: exclusão bloqueada enquanto houver dependências, e histórico de pedidos preservado.

**Prioridade** — Pós-MVP

---

## OFER — Oferta

### RF-OFER-01 — Criar oferta vinculada a um produto

**Descrição** — O sistema deve permitir criar ofertas — variações comerciais — sempre vinculadas a um produto da conta.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um produto existente, Quando o usuário cria uma oferta com nome interno e valor, Então a oferta passa a constar entre as ofertas daquele produto.
- Dado um valor menor ou igual a zero, Quando o usuário salva, Então a criação é recusada.
- Dado um produto que já tem ofertas, Quando o usuário cria mais uma, Então ambas coexistem sem que a nova entre automaticamente em nenhum checkout (RF-OFER-05).
- Dado uma oferta recém-criada, Quando o usuário volta ao produto, Então vê a oferta com seu valor formatado em BRL.

**Regras de negócio**
- Campos: **nome** (obrigatório, uso interno — não aparece para o comprador), **valor** (obrigatório, em centavos, moeda BRL, maior que zero), **URL do entregável** (opcional, com fallback para o produto — RF-OFER-02).
- Cardinalidade: um produto tem N ofertas; uma oferta pertence a exatamente um produto e a uma conta.
- **Preço é atributo da oferta, nunca do produto nem do checkout.**

> ⚠️ Suposição: o blueprint diz que o nome da oferta é "de uso interno" mas não define qual texto o comprador vê na página pública. Assumido: a página pública exibe o **nome de exibição do checkout** e os dados do **produto**; o nome da oferta não é mostrado ao comprador.

**Prioridade** — MVP

### RF-OFER-02 — Fallback da URL do entregável para o produto

**Descrição** — O sistema deve resolver a URL do entregável de uma oferta usando a URL própria da oferta e, na ausência dela, a URL do entregável padrão do produto.

**Ator** — Sistema.

**Critérios de aceite**
- Dada uma oferta com URL do entregável preenchida, Quando um pedido dela é aprovado, Então o comprador recebe a URL da oferta.
- Dada uma oferta sem URL do entregável e um produto com URL padrão, Quando um pedido é aprovado, Então o comprador recebe a URL do produto.
- Dada uma oferta sem URL do entregável e um produto sem URL padrão, Quando o usuário tenta salvar a oferta, Então o sistema recusa exigindo o entregável em um dos dois níveis.

**Regras de negócio**
- A resolução acontece no momento da entrega e é congelada no pedido (RF-PAG-06).
- Por ora o override do produto pela oferta se restringe à URL do entregável; nenhum outro campo tem esse comportamento.

> ⚠️ Suposição: o blueprint não diz o que acontece quando nem oferta nem produto têm entregável. Assumido: pelo menos um dos dois níveis deve ter a URL, validado no salvamento da oferta.

**Prioridade** — MVP

### RF-OFER-03 — Editar oferta

**Descrição** — O sistema deve permitir alterar nome, valor e URL do entregável de uma oferta existente.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dada uma oferta vinculada a um checkout ativo, Quando o usuário altera o valor e salva, Então a página pública daquela oferta passa a cobrar o novo valor.
- Dado um pedido já criado com o valor antigo, Quando o valor da oferta muda, Então o pedido mantém o valor original.
- Dado um envio com valor inválido, Quando o usuário salva, Então a edição é recusada.

**Regras de negócio**
- Mudança de valor afeta apenas cobranças futuras; pedidos existentes são imutáveis quanto a valor.
- Uma oferta não pode ser movida para outro produto.

**Prioridade** — MVP

### RF-OFER-04 — Excluir oferta

**Descrição** — O sistema deve permitir excluir uma oferta que não esteja vinculada a nenhum checkout.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dada uma oferta sem vínculo com checkout, Quando o usuário confirma a exclusão, Então ela some da lista de ofertas do produto.
- Dada uma oferta vinculada a um checkout, Quando o usuário tenta excluí-la, Então a exclusão é recusada, orientando a desvinculá-la antes (RF-CHK-05).
- Dada uma oferta com pedidos históricos, Quando é excluída, Então os pedidos permanecem consultáveis no analytics.

**Regras de negócio**
- Excluir uma oferta invalida sua URL pública, que passa a responder como indisponível (RF-PUB-01).

> ⚠️ Suposição: o blueprint não trata de exclusão de oferta. Assumido o mesmo padrão de RF-PROD-04 — bloqueio por dependência e preservação do histórico.

**Prioridade** — Pós-MVP

### RF-OFER-05 — Reuso do produto e não propagação automática de ofertas

**Descrição** — O sistema não deve inserir automaticamente uma oferta em nenhum checkout: todo vínculo entre oferta e checkout é manual.

**Ator** — Sistema.

**Critérios de aceite**
- Dado um produto já vinculado a um checkout, Quando o usuário cria uma nova oferta desse produto, Então nenhum checkout passa a expô-la até que o vínculo seja feito manualmente.
- Dado um produto usado por dois checkouts diferentes, Quando o usuário vincula uma oferta ao checkout A, Então o checkout B permanece inalterado.
- Dado um produto usado em vários checkouts, Quando o usuário edita o produto, Então todos os checkouts refletem a edição (o produto é compartilhado; o vínculo de ofertas não).

**Regras de negócio**
- Um mesmo produto pode ser reutilizado por N checkouts.
- Uma mesma oferta pode estar vinculada a mais de um checkout, cada vínculo gerando sua própria URL pública (RF-CHK-05).

**Prioridade** — MVP

---

## CHK — Checkout, builder e tracking

### RF-CHK-01 — Criar checkout vinculado a um produto

**Descrição** — O sistema deve permitir criar um checkout associado a exatamente um produto da conta.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um produto existente, Quando o usuário cria um checkout informando título interno e nome de exibição, Então o checkout é criado vinculado àquele produto.
- Dado o formulário sem título interno ou sem nome de exibição, Quando é enviado, Então a criação é recusada com erro no campo faltante.
- Dado um checkout recém-criado, Quando o usuário abre sua página interna, Então vê a área de ofertas vazia, sem nenhuma oferta vinculada.
- Dado URLs de banner informadas, Quando o usuário salva, Então elas passam a ser usadas na página pública conforme o dispositivo.

**Regras de negócio**
- Campos: **título interno** (obrigatório, aparece só no painel), **nome de exibição** (obrigatório, usado como título da página pública e no footer), **URL do banner desktop** (opcional), **URL do banner mobile** (opcional).
- Cardinalidade: um checkout pertence a **um** produto e a uma conta; um produto tem 0..N checkouts.
- A criação não vincula nenhuma oferta automaticamente (RF-OFER-05).

**Prioridade** — MVP

### RF-CHK-02 — Listar checkouts da conta

**Descrição** — O sistema deve listar os checkouts da conta com acesso rápido à página interna de cada um.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um usuário com checkouts, Quando abre a listagem, Então vê apenas os checkouts da própria conta, identificados pelo título interno e pelo produto associado.
- Dado um usuário sem checkouts, Quando abre a listagem, Então vê estado vazio com chamada para criar o primeiro.
- Dado um checkout na lista, Quando o usuário o seleciona, Então navega para a página interna dele (RF-CHK-06).

**Regras de negócio**
- Listagem escopada pela conta.

**Prioridade** — MVP

### RF-CHK-03 — Editar dados de identidade do checkout

**Descrição** — O sistema deve permitir editar título interno, nome de exibição e URLs de banner de um checkout existente.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um checkout existente, Quando o usuário altera o nome de exibição e salva, Então a página pública passa a exibir o novo texto no título e no footer.
- Dado um checkout existente, Quando o usuário troca a URL do banner mobile, Então apenas o acesso mobile à página pública muda.
- Dado um envio com campo obrigatório vazio, Quando o usuário salva, Então a edição é recusada.

**Regras de negócio**
- O produto vinculado ao checkout não é editável após a criação; trocar de produto exige criar outro checkout.
- Edições não afetam pedidos já criados (RF-PAG-06).

> ⚠️ Suposição: o blueprint não diz se o produto de um checkout pode ser trocado. Assumido: imutável, para não invalidar as ofertas já vinculadas.

**Prioridade** — MVP

### RF-CHK-04 — Excluir checkout

**Descrição** — O sistema deve permitir excluir um checkout, encerrando suas URLs públicas.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um checkout, Quando o usuário confirma a exclusão, Então ele some da listagem e suas URLs públicas passam a responder como indisponíveis.
- Dado o diálogo de exclusão, Quando o usuário cancela, Então nada muda.
- Dado um checkout excluído com vendas no período, Quando o usuário consulta o analytics, Então o faturamento histórico continua contabilizado.

**Regras de negócio**
- Exclusão exige confirmação explícita e não apaga pedidos.

> ⚠️ Suposição: exclusão de checkout não é mencionada no blueprint. Assumido comportamento análogo a produto e oferta.

**Prioridade** — Pós-MVP

### RF-CHK-05 — Vincular e desvincular ofertas do checkout (1 URL pública por oferta)

**Descrição** — O sistema deve permitir vincular manualmente ofertas do produto ao checkout, gerando uma URL pública distinta por oferta vinculada.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um checkout e as ofertas do seu produto, Quando o usuário vincula uma oferta, Então uma URL pública única é gerada para o par checkout+oferta e fica visível para cópia.
- Dado um checkout com três ofertas vinculadas, Quando o usuário consulta a área de ofertas, Então vê três URLs públicas distintas.
- Dado um checkout, Quando o usuário tenta vincular uma oferta de outro produto, Então o vínculo é recusado.
- Dado uma oferta vinculada, Quando o usuário a desvincula, Então sua URL pública deixa de responder e nenhuma outra URL do checkout é afetada.

**Regras de negócio**
- Só ofertas do **mesmo produto** do checkout podem ser vinculadas.
- Cardinalidade: checkout expõe 0..N ofertas; cada vínculo produz exatamente **1 URL pública**.
- Um checkout sem oferta vinculada não tem nenhuma página pública acessível.
- A URL é estável enquanto o vínculo existir; desvincular e revincular não precisa preservá-la.

> ⚠️ Suposição: o blueprint não define o formato da URL pública nem se ela é reaproveitada após desvínculo. Assumido: identificador opaco/estável por vínculo, sem garantia de reuso.

**Prioridade** — MVP

### RF-CHK-06 — Página interna do checkout com as quatro áreas

**Descrição** — O sistema deve oferecer, dentro de cada checkout, quatro áreas: analytics do checkout, produtos e ofertas vinculadas, tracking/pixels e builder.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um checkout, Quando o usuário abre sua página interna, Então encontra as áreas de analytics, ofertas vinculadas, tracking/pixels e builder.
- Dado a área de analytics do checkout, Quando é exibida, Então mostra o funil deste checkout, e não métricas agregadas da conta.
- Dado o usuário navegando entre as áreas, Quando alterna, Então permanece no contexto do mesmo checkout.

**Regras de negócio**
- As métricas de diagnóstico (funil, conversão, abandono do PIX) existem **apenas** aqui, nunca na home (RF-ANL-06).

**Prioridade** — MVP

### RF-CHK-07 — Builder: customização manual por campos

**Descrição** — O sistema deve permitir customizar a aparência da página pública do checkout por meio de campos de formulário, como seletores de cor.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado o builder aberto, Quando o usuário altera uma cor, Então o preview reflete a mudança (RF-CHK-09).
- Dado alterações feitas no builder, Quando o usuário salva, Então a página pública passa a usar a nova customização.
- Dado um valor inválido em um campo de customização, Quando o usuário salva, Então o salvamento é recusado com erro no campo.
- Dado um checkout nunca customizado, Quando o usuário abre o builder, Então vê os valores padrão do tema.

**Regras de negócio**
- A customização é por **checkout** e vale para todas as URLs públicas dele.
- A customização manual e a customização via JSON (RF-CHK-08) operam sobre o **mesmo** conjunto de propriedades — são duas interfaces para o mesmo estado.
- Existe um conjunto padrão aplicado quando nenhuma customização foi salva.

> ⚠️ Suposição: o blueprint cita apenas "inputs de cor etc." sem enumerar as propriedades customizáveis. Assumido: o catálogo de propriedades é fixo e definido pelo produto, e o JSON aceita exatamente esse catálogo.

**Prioridade** — MVP

### RF-CHK-08 — Builder: customização via JSON com importação e sobrescrita confirmada

**Descrição** — O sistema deve permitir customizar o checkout via JSON, com guia embutido, editor e importação que exige confirmação de sobrescrita.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado o builder, Quando o usuário aciona "Customizar via JSON", Então abre um popup com o guia de uso e um editor de JSON.
- Dado o editor preenchido com JSON válido, Quando o usuário aciona "Importar", Então o sistema pede confirmação avisando que a customização atual será sobrescrita.
- Dado o aviso de sobrescrita, Quando o usuário confirma, Então a customização anterior é substituída integralmente e os campos manuais passam a refletir o JSON importado.
- Dado o aviso de sobrescrita, Quando o usuário cancela, Então a customização atual permanece intacta.
- Dado um JSON malformado ou com propriedades desconhecidas, Quando o usuário importa, Então a importação é recusada com mensagem apontando o problema, sem alterar nada.

**Regras de negócio**
- Importação é **substituição total**, não merge parcial.
- O JSON é validado contra o catálogo de propriedades suportadas antes de qualquer alteração de estado.
- O guia fica acessível dentro do próprio popup.

**Prioridade** — MVP

### RF-CHK-09 — Builder: preview lado a lado com toggle desktop/mobile

**Descrição** — O sistema deve exibir, ao lado dos controles do builder, um preview da página pública com alternância entre visualização desktop e mobile.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado o builder aberto, Quando a tela é exibida, Então controles e preview aparecem lado a lado.
- Dado o preview em modo desktop, Quando o usuário alterna para mobile, Então o preview passa a renderizar o layout mobile, inclusive o banner mobile.
- Dado uma alteração ainda não salva, Quando o usuário a faz, Então o preview a reflete antes do salvamento.

**Regras de negócio**
- O preview reproduz a página pública real, incluindo banner, produto/oferta, preço e campos do comprador.
- Alterar o preview não persiste nada — persistência só no salvamento (RF-CHK-07) ou na importação confirmada (RF-CHK-08).

> ⚠️ Suposição: o blueprint não diz qual oferta o preview usa quando o checkout tem várias. Assumido: a primeira oferta vinculada, ou um placeholder quando não há nenhuma.

**Prioridade** — MVP

### RF-CHK-10 — Tracking/pixels por checkout (Facebook, Utmify)

**Descrição** — O sistema deve permitir configurar pixels de rastreamento por checkout, com suporte a Facebook e Utmify.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado a área de tracking de um checkout, Quando o usuário informa o identificador do pixel do Facebook e salva, Então as páginas públicas daquele checkout passam a carregar esse pixel.
- Dado dois checkouts da mesma conta, Quando cada um tem um pixel diferente, Então as páginas públicas de cada um carregam apenas o pixel correspondente.
- Dado um identificador em formato inválido, Quando o usuário salva, Então o salvamento é recusado.
- Dado um pixel configurado, Quando o usuário o remove, Então as páginas públicas do checkout deixam de carregá-lo.

**Regras de negócio**
- Tracking é configurado **por checkout** (cada checkout costuma ser uma campanha), ao contrário do gateway, que é por conta (RF-GTW-03).
- Providers do MVP: Facebook e Utmify. Ambos são opcionais e independentes entre si.

**Prioridade** — MVP

### RF-CHK-11 — Gerar JSON de customização via IA a partir do contexto do produto

**Descrição** — O sistema deve permitir gerar automaticamente um JSON de customização usando o contexto do produto como entrada.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado o popup de customização via JSON, Quando o usuário aciona a geração por IA, Então o editor é preenchido com um JSON válido derivado do produto do checkout.
- Dado um JSON gerado por IA, Quando o usuário aciona "Importar", Então vale o mesmo fluxo de confirmação de sobrescrita de RF-CHK-08.
- Dada uma falha na geração, Quando ela ocorre, Então o editor mantém o conteúdo anterior e o usuário é informado.

**Regras de negócio**
- O JSON gerado passa pela mesma validação de catálogo de RF-CHK-08 antes de qualquer aplicação.
- Nada é aplicado sem confirmação explícita do usuário.
- Blueprint classifica como "ideia de diferencial", não como escopo fechado.

**Prioridade** — Pós-MVP

---

## PUB — Página pública (fluxo do comprador)

### RF-PUB-01 — Servir a página pública de uma oferta pela sua URL

**Descrição** — O sistema deve renderizar publicamente, sem autenticação, a página de checkout correspondente à URL de uma oferta vinculada.

**Ator** — Comprador anônimo.

**Critérios de aceite**
- Dada uma URL pública válida, Quando o comprador a acessa, Então vê o banner, os dados do produto, o preço da oferta, os campos do formulário e o botão de gerar PIX, com a customização do checkout aplicada.
- Dado um acesso por dispositivo móvel, Quando a página carrega, Então o banner mobile é usado; em desktop, o banner desktop.
- Dada uma URL de oferta desvinculada, excluída, ou de checkout inexistente, Quando o comprador acessa, Então recebe página de indisponibilidade, sem vazar dados da conta.
- Dado um checkout cuja conta não tem gateway conectado, Quando o comprador acessa, Então a página informa indisponibilidade de pagamento e não permite gerar PIX (RF-GTW-03).

**Regras de negócio**
- A página é pública e não exige login; o comprador não tem conta nem painel.
- Preço exibido é o da oferta, em BRL.
- O título da página e o footer usam o **nome de exibição** do checkout.
- Nenhum dado de outra conta ou de outro checkout pode ser alcançado a partir da URL.

**Prioridade** — MVP

### RF-PUB-02 — Coletar nome, e-mail e CPF do comprador

**Descrição** — O sistema deve exigir nome, e-mail e CPF do comprador antes de gerar a cobrança.

**Ator** — Comprador anônimo.

**Critérios de aceite**
- Dado o formulário público, Quando o comprador envia com algum dos três campos vazio, Então o envio é recusado com erro no campo.
- Dado um CPF com dígitos verificadores inválidos, Quando o comprador envia, Então o envio é recusado.
- Dado um e-mail em formato inválido, Quando o comprador envia, Então o envio é recusado.
- Dado os três campos válidos, Quando o comprador envia, Então o pedido é criado (RF-PAG-01).

**Regras de negócio**
- Os três campos — **nome**, **e-mail**, **CPF** — são obrigatórios; não há campos opcionais no formulário público no MVP.
- CPF normalizado para dígitos; e-mail normalizado para minúsculas.
- O e-mail é o canal de entrega do produto (RF-PAG-05).

**Prioridade** — MVP

### RF-PUB-03 — Gerar cobrança PIX a partir do formulário

**Descrição** — O sistema deve, ao receber o formulário válido, gerar uma cobrança PIX no gateway da conta e conduzir o comprador à tela do PIX.

**Ator** — Comprador anônimo.

**Critérios de aceite**
- Dado o formulário válido e gateway conectado, Quando o comprador aciona "gerar PIX", Então é criada uma cobrança no valor da oferta e ele é levado à tela do PIX.
- Dado o botão acionado, Quando a requisição está em curso, Então o botão fica em estado de carregamento, impedindo envio duplicado.
- Dada uma falha do gateway, Quando a cobrança não pode ser criada, Então o comprador vê mensagem de erro e permanece no formulário, com os dados preenchidos preservados.

**Regras de negócio**
- Valor da cobrança = valor da oferta, sempre em BRL; o comprador não pode alterá-lo.
- Nenhuma cobrança é gerada sem gateway conectado e válido.

**Prioridade** — MVP

### RF-PUB-04 — Tela do PIX com QR Code, copia-e-cola e timer

**Descrição** — O sistema deve exibir ao comprador o QR Code, o código copia-e-cola e o tempo restante para pagamento.

**Ator** — Comprador anônimo.

**Critérios de aceite**
- Dada uma cobrança criada, Quando a tela do PIX carrega, Então exibe QR Code, código copia-e-cola e contador regressivo até a expiração.
- Dado o código exibido, Quando o comprador aciona "copiar", Então o código vai para a área de transferência com confirmação visual.
- Dado o contador chegando a zero sem pagamento, Quando expira, Então a tela informa a expiração e o QR Code deixa de ser válido (RF-PAG-03).
- Dado o comprador recarregando a página do PIX antes da expiração, Quando ela carrega, Então a mesma cobrança continua sendo exibida.

**Regras de negócio**
- O prazo exibido é o prazo de expiração da cobrança e deve coincidir com o registrado no gateway.
- Timer é informativo: quem define a expiração real é o pedido/gateway.

**Prioridade** — MVP

### RF-PUB-05 — Atualização automática do status do pagamento

**Descrição** — O sistema deve atualizar automaticamente o status exibido ao comprador de "aguardando pagamento" para "pago", sem ação manual dele.

**Ator** — Sistema.

**Critérios de aceite**
- Dado o comprador na tela do PIX, Quando o pagamento é confirmado (RF-PAG-04), Então a tela avança sozinha para a tela de obrigado.
- Dado o comprador na tela do PIX, Quando ainda não houve pagamento, Então o status permanece "aguardando" e o timer continua correndo.
- Dado o pedido expirado, Quando o status é atualizado, Então a tela mostra expiração e oferece recomeçar a compra.

**Regras de negócio**
- A atualização não exige recarregar a página nem clicar em "já paguei".
- Só a confirmação do gateway (RF-PAG-04) muda o status para pago.

> ⚠️ Suposição: o blueprint diz "status automático (aguardando → pago)" sem definir o mecanismo. Assumido: comportamento observável de atualização automática, com mecanismo (polling ou push) deixado para a etapa técnica.

**Prioridade** — MVP

### RF-PUB-06 — Tela de obrigado com acesso ao entregável

**Descrição** — O sistema deve exibir, após a confirmação do pagamento, uma tela de agradecimento com o acesso ao entregável e o aviso de envio por e-mail.

**Ator** — Comprador anônimo.

**Critérios de aceite**
- Dado um pedido pago, Quando a tela de obrigado carrega, Então mostra confirmação da compra, o acesso ao entregável e o aviso de que o acesso também foi enviado por e-mail.
- Dado o entregável resolvido pela regra de fallback, Quando a tela exibe o acesso, Então usa a URL correta (RF-OFER-02).
- Dado um pedido não pago, Quando alguém acessa a tela de obrigado diretamente, Então o acesso ao entregável não é exibido.

**Regras de negócio**
- O acesso ao entregável só é exposto para pedido em status **pago**.
- O aviso de envio por e-mail é obrigatório na tela.

**Prioridade** — MVP

### RF-PUB-07 — Lembrança dos dados do comprador em compras futuras

**Descrição** — O sistema deve poder pré-preencher o formulário público com os dados usados por aquele comprador em uma compra anterior.

**Ator** — Comprador anônimo.

**Critérios de aceite**
- Dado um comprador que já comprou no mesmo navegador, Quando abre uma página pública de checkout, Então nome, e-mail e CPF vêm pré-preenchidos e editáveis.
- Dado o pré-preenchimento, Quando o comprador altera qualquer campo, Então o valor alterado prevalece.
- Dado um comprador novo, Quando abre a página, Então o formulário vem vazio.

**Regras de negócio**
- É conveniência, não identidade: **não existe conta, login ou painel do comprador**.
- Os dados lembrados nunca podem ser expostos entre compradores diferentes.

> ⚠️ Suposição: o blueprint diz que os dados servem "no máximo para lembrança", sem definir escopo. Assumido: lembrança local ao navegador do comprador, nunca cross-device nem cross-comprador.

**Prioridade** — Pós-MVP

### RF-PUB-08 — Disparar eventos de tracking ao longo do fluxo público

**Descrição** — O sistema deve disparar os eventos dos pixels configurados no checkout nos momentos-chave do fluxo do comprador.

**Ator** — Sistema.

**Critérios de aceite**
- Dado um checkout com pixel configurado, Quando o comprador abre a página pública, Então o evento de visualização é disparado.
- Dado o mesmo checkout, Quando a cobrança PIX é gerada, Então o evento de início de checkout é disparado.
- Dado o pedido confirmado como pago, Quando a tela de obrigado é exibida, Então o evento de compra é disparado com o valor da oferta.
- Dado um checkout sem pixel configurado, Quando o comprador percorre o fluxo, Então nenhum evento externo é disparado.

**Regras de negócio**
- Os eventos usam somente os pixels do **checkout acessado** (RF-CHK-10).
- Falha no disparo de um pixel não pode interromper nem bloquear o fluxo de compra.

> ⚠️ Suposição: o blueprint cita "tracking/pixels" sem enumerar eventos. Assumidos os três momentos acima (visualização, início de checkout, compra) como o conjunto mínimo.

**Prioridade** — MVP

---

## PAG — Pedido e pagamento PIX

### RF-PAG-01 — Criar pedido no envio do formulário

**Descrição** — O sistema deve criar um pedido no momento em que o comprador envia o formulário público válido e a cobrança PIX é gerada.

**Ator** — Comprador anônimo.

**Critérios de aceite**
- Dado um formulário válido, Quando a cobrança é gerada com sucesso, Então existe um pedido em status `aguardando_pagamento` associado ao checkout, à oferta e à conta.
- Dada uma falha na criação da cobrança no gateway, Quando o erro ocorre, Então nenhum pedido pendente inconsistente permanece visível no analytics.
- Dado o mesmo comprador gerando PIX duas vezes, Quando envia o formulário novamente, Então são dois pedidos independentes.

**Regras de negócio**
- Pedido pertence a: uma conta, um checkout, uma oferta (e, por ela, um produto).
- Todo pedido nasce em `aguardando_pagamento`.
- O pedido guarda os dados do comprador (nome, e-mail, CPF) e os dados comerciais congelados (RF-PAG-06).

**Prioridade** — MVP

### RF-PAG-02 — Ciclo de vida do pedido

**Descrição** — O sistema deve manter o pedido em exatamente um dos estados `aguardando_pagamento`, `pago` ou `expirado`, com transições unidirecionais.

**Ator** — Sistema.

**Critérios de aceite**
- Dado um pedido `aguardando_pagamento`, Quando o pagamento é confirmado, Então ele passa a `pago`.
- Dado um pedido `aguardando_pagamento`, Quando o prazo do PIX vence sem confirmação, Então ele passa a `expirado`.
- Dado um pedido `pago`, Quando chega uma confirmação de expiração ou um novo evento de pagamento, Então ele permanece `pago`.
- Dado um pedido `expirado`, Quando chega uma confirmação de pagamento tardia do gateway, Então o sistema registra o evento e o pedido é tratado como `pago`.

**Regras de negócio**
- Transições válidas: `aguardando_pagamento → pago` e `aguardando_pagamento → expirado`. `pago` é terminal.
- Os três estados alimentam diretamente os cards de analytics (RF-ANL-03): aprovadas = `pago`, pendentes = `aguardando_pagamento`, expiradas = `expirado`.

> ⚠️ Suposição: o blueprint não define o que fazer com pagamento confirmado após a expiração. Assumido: o pagamento confirmado prevalece (`expirado → pago`), por ser dinheiro efetivamente recebido; a decisão precisa ser validada com o comportamento real do EfiBank.

**Prioridade** — MVP

### RF-PAG-03 — Expirar pedido não pago no fim do prazo do PIX

**Descrição** — O sistema deve marcar como expirado o pedido cujo prazo de pagamento do PIX se encerrou sem confirmação.

**Ator** — Sistema.

**Critérios de aceite**
- Dado um pedido `aguardando_pagamento` com prazo vencido, Quando o sistema avalia seu estado, Então o pedido passa a `expirado`.
- Dado um pedido expirado, Quando o comprador acessa novamente a tela do PIX, Então vê a informação de expiração e não consegue pagar aquele código.
- Dado um pedido expirado, Quando o analytics do período é consultado, Então ele é contado entre as vendas expiradas e não entra no faturamento.

**Regras de negócio**
- A expiração é automática, sem ação do usuário ou do comprador.
- Pedido expirado não pode ser reaberto; comprar de novo significa gerar um novo pedido.

> ⚠️ Suposição: o blueprint não define a duração do prazo de expiração do PIX. Assumido: prazo único definido pelo produto (configuração do sistema, não do usuário) até que se decida o contrário.

**Prioridade** — MVP

### RF-PAG-04 — Confirmar pagamento a partir do webhook

**Descrição** — O sistema deve confirmar o pagamento de um pedido a partir da notificação recebida do gateway.

**Ator** — Webhook do gateway.

**Critérios de aceite**
- Dado um pedido `aguardando_pagamento`, Quando chega um webhook de pagamento confirmado para a cobrança correspondente, Então o pedido passa a `pago`, dispara a entrega (RF-PAG-05) e a tela do comprador avança (RF-PUB-05).
- Dado um webhook referente a uma cobrança desconhecida, Quando é recebido, Então é descartado sem efeito colateral.
- Dado um webhook repetido para a mesma cobrança, Quando é recebido, Então o pedido continua `pago` e a entrega **não** é reenviada (RF-GTW-02).
- Dado um webhook com assinatura/credencial inválida, Quando é recebido, Então é rejeitado sem alterar nenhum pedido.

**Regras de negócio**
- Somente o webhook (ou consulta equivalente ao gateway) muda o pedido para `pago`; nunca uma ação do comprador.
- A correlação webhook ↔ pedido é feita pelo identificador da cobrança no gateway.

**Prioridade** — MVP

### RF-PAG-05 — Enviar entregável por e-mail após aprovação

**Descrição** — O sistema deve enviar ao e-mail do comprador o acesso ao entregável assim que o pedido for aprovado.

**Ator** — Sistema.

**Critérios de aceite**
- Dado um pedido que passou a `pago`, Quando a transição ocorre, Então um e-mail é enviado ao endereço informado no formulário contendo o acesso ao entregável.
- Dado o entregável resolvido por fallback, Quando o e-mail é montado, Então usa a URL correta segundo RF-OFER-02.
- Dado um webhook duplicado, Quando é processado, Então nenhum e-mail adicional é enviado.
- Dada uma falha no envio do e-mail, Quando ela ocorre, Então o pedido permanece `pago` e a tela de obrigado continua exibindo o acesso.

**Regras de negócio**
- O e-mail é complementar à tela de obrigado, nunca substituto dela.
- Exatamente um e-mail de entrega por pedido aprovado.

**Prioridade** — MVP

### RF-PAG-06 — Congelar os dados comerciais no pedido

**Descrição** — O sistema deve registrar no pedido, no momento da criação, os dados comerciais vigentes, de modo que alterações posteriores em produto, oferta ou checkout não o modifiquem.

**Ator** — Sistema.

**Critérios de aceite**
- Dado um pedido criado com valor X, Quando o valor da oferta muda depois, Então o pedido e o analytics continuam refletindo X.
- Dado um pedido criado, Quando o nome do produto ou o nome de exibição do checkout muda, Então o histórico do pedido mantém os textos originais.
- Dada a exclusão da oferta, Quando ela ocorre, Então os pedidos anteriores permanecem consultáveis com seus dados.

**Regras de negócio**
- Congelados no pedido: valor e moeda, identificação do produto/oferta/checkout, URL do entregável resolvida, e os dados do comprador.
- Faturamento histórico é imutável.

> ⚠️ Suposição: o blueprint não fala em snapshot de pedido. Assumido como necessário para que o analytics de período seja consistente e auditável.

**Prioridade** — MVP

---

## GTW — Gateway de pagamento

### RF-GTW-01 — Conectar gateway a nível de conta (EfiBank PIX)

**Descrição** — O sistema deve permitir que o usuário conecte, em página própria e única, o gateway de pagamento da sua conta, começando pelo EfiBank com PIX.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um usuário sem gateway conectado, Quando abre a página de Gateway, Então vê o estado "não conectado" e o formulário de conexão do EfiBank.
- Dado o formulário de credenciais preenchido corretamente, Quando o usuário salva, Então a conta passa a ter gateway conectado e o estado exibido muda para "conectado".
- Dado um usuário com gateway conectado, Quando abre Configurações da conta, Então **não** encontra ali a configuração de gateway (ela vive em página separada).

**Regras de negócio**
- Configuração é **global por conta**: conecta uma vez, todos os checkouts herdam (RF-GTW-03).
- Uma conta tem no máximo um gateway conectado no MVP.
- Provider do MVP: EfiBank, método PIX.
- Credenciais são segredo: nunca exibidas de volta em texto claro depois de salvas.

**Prioridade** — MVP

### RF-GTW-02 — Receber e processar webhook do gateway de forma idempotente

**Descrição** — O sistema deve receber notificações do gateway e processá-las de forma idempotente, sem duplicar efeitos.

**Ator** — Webhook do gateway.

**Critérios de aceite**
- Dado um webhook recebido pela primeira vez, Quando é processado, Então produz seus efeitos (transição do pedido e entrega).
- Dado o mesmo webhook reenviado pelo gateway, Quando é processado novamente, Então nenhum efeito é repetido e a resposta continua de sucesso.
- Dado um webhook com credencial/assinatura inválida, Quando é recebido, Então é rejeitado e registrado.
- Dado um webhook para conta ou cobrança desconhecida, Quando é recebido, Então é descartado sem alterar dados.

**Regras de negócio**
- Idempotência baseada no identificador do evento/cobrança do gateway.
- O webhook é resolvido para exatamente **uma conta**; nunca pode afetar pedidos de outra.
- Falha de processamento deve permitir reentrega pelo gateway sem risco de duplicação.

**Prioridade** — MVP

### RF-GTW-03 — Herança do gateway por todos os checkouts da conta

**Descrição** — O sistema deve usar automaticamente o gateway da conta em todos os checkouts dela, sem configuração por checkout.

**Ator** — Sistema.

**Critérios de aceite**
- Dada uma conta com gateway conectado, Quando qualquer checkout dela gera um PIX, Então usa as credenciais da conta.
- Dada uma conta sem gateway conectado, Quando um comprador acessa qualquer página pública dela, Então não consegue gerar PIX (RF-PUB-01).
- Dado um usuário criando um checkout, Quando percorre o formulário, Então não há nenhum campo de gateway ali.

**Regras de negócio**
- Gateway é por conta; tracking/pixels é por checkout (RF-CHK-10). São eixos deliberadamente diferentes.
- Nenhum checkout pode sobrescrever o gateway da conta no MVP.

**Prioridade** — MVP

### RF-GTW-04 — Editar credenciais e desconectar o gateway

**Descrição** — O sistema deve permitir substituir as credenciais do gateway ou desconectá-lo.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um gateway conectado, Quando o usuário informa novas credenciais válidas e salva, Então as antigas são substituídas e as novas passam a valer para todas as cobranças seguintes.
- Dado um gateway conectado, Quando o usuário aciona "desconectar" e confirma, Então a conta volta ao estado "não conectado" e as páginas públicas deixam de gerar PIX.
- Dada a desconexão, Quando existem pedidos pendentes, Então eles seguem seu curso normal de confirmação ou expiração.

**Regras de negócio**
- Desconectar exige confirmação explícita, com aviso de que as vendas param.
- Desconexão não apaga pedidos nem histórico de analytics.

> ⚠️ Suposição: o blueprint não trata de troca ou remoção de credenciais. Assumido como necessário para operação (rotação de chaves, troca de conta no provedor).

**Prioridade** — MVP

### RF-GTW-05 — Validar credenciais no momento da conexão

**Descrição** — O sistema deve verificar junto ao provedor que as credenciais informadas são válidas antes de marcar a conta como conectada.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dadas credenciais inválidas, Quando o usuário salva, Então a conexão é recusada com mensagem clara e a conta permanece "não conectada".
- Dadas credenciais válidas, Quando o usuário salva, Então a conta é marcada como conectada.
- Dada indisponibilidade momentânea do provedor, Quando a validação falha por erro de comunicação, Então o usuário é informado da falha temporária e pode tentar de novo.

**Regras de negócio**
- Nenhuma conta é marcada como conectada com credenciais não verificadas — isso evita descobrir o problema só na primeira venda.

> ⚠️ Suposição: validação na conexão não está no blueprint. Assumida por ser pré-requisito prático de "integração com gateway" no MVP.

**Prioridade** — MVP

### RF-GTW-06 — Suporte a múltiplos providers de gateway

**Descrição** — O sistema deve permitir que a conta escolha entre diferentes provedores de gateway além do EfiBank.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado mais de um provider disponível, Quando o usuário abre a página de Gateway, Então escolhe qual conectar.
- Dado um provider conectado, Quando o usuário troca de provider, Então as cobranças seguintes passam a usar o novo.

**Regras de negócio**
- Blueprint define o EfiBank apenas como "primeiro provider", o que implica outros no futuro, sem lista nem prazo.

**Prioridade** — Pós-MVP

---

## ANL — Analytics

### RF-ANL-01 — Seletor de período único controlando a home

**Descrição** — O sistema deve oferecer na home um único seletor de período que controla todos os componentes da tela.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dada a home, Quando o usuário escolhe "7 dias", Então faturamento, ticket médio, cards, gráfico e ranking passam todos a refletir esse período.
- Dado o seletor, Quando o usuário escolhe "Personalizado", Então informa data inicial e final e a tela recalcula sobre esse intervalo.
- Dado um período sem vendas, Quando a home carrega, Então todos os componentes exibem estado zerado/vazio, sem erro.
- Dado o primeiro acesso à home, Quando ela carrega, Então um período padrão já vem selecionado.

**Regras de negócio**
- Opções: **Hoje**, **7 dias**, **30 dias**, **Personalizado**.
- Não existe seletor de período por componente — o seletor é único para a tela toda.
- No período personalizado, a data final não pode ser anterior à inicial.
- Todos os cálculos usam o fuso horário de São Paulo (America/Sao_Paulo).

> ⚠️ Suposição: o blueprint não define o período padrão nem o fuso. Assumidos "7 dias" como padrão e America/Sao_Paulo como fuso de referência.

**Prioridade** — MVP

### RF-ANL-02 — Faturamento e ticket médio do período

**Descrição** — O sistema deve exibir na home o faturamento e o ticket médio da conta no período selecionado.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um período com pedidos pagos, Quando a home carrega, Então o faturamento é a soma dos valores desses pedidos e o ticket médio é faturamento dividido pela quantidade deles.
- Dado um período sem pedidos pagos, Quando a home carrega, Então faturamento e ticket médio são exibidos como zero.
- Dados pedidos pendentes ou expirados no período, Quando o faturamento é calculado, Então eles não são somados.

**Regras de negócio**
- Faturamento considera **apenas** pedidos em status `pago`.
- Valores exibidos em BRL.
- A data de referência do pedido para o período é a data de aprovação do pagamento.

> ⚠️ Suposição: o blueprint não diz se o pedido entra no período pela data de criação ou de aprovação. Assumida a data de aprovação, coerente com "faturamento do período".

**Prioridade** — MVP

### RF-ANL-03 — Cards de vendas aprovadas, pendentes e expiradas

**Descrição** — O sistema deve exibir na home três cards com a contagem de vendas aprovadas, pendentes e expiradas no período.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um período selecionado, Quando a home carrega, Então cada card mostra a contagem de pedidos no status correspondente.
- Dado o período alterado, Quando o usuário muda o seletor, Então os três cards se atualizam juntos.
- Dado um período sem pedidos, Quando a home carrega, Então os três cards mostram zero.

**Regras de negócio**
- Mapeamento direto dos estados de RF-PAG-02: aprovadas = `pago`, pendentes = `aguardando_pagamento`, expiradas = `expirado`.
- Contagens são da conta inteira, somando todos os checkouts.

**Prioridade** — MVP

### RF-ANL-04 — Gráfico de vendas ao longo do período

**Descrição** — O sistema deve exibir na home um gráfico da evolução das vendas dentro do período selecionado.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um período de 7 ou 30 dias, Quando a home carrega, Então o gráfico mostra a série diária de vendas do período.
- Dado o período "Hoje", Quando a home carrega, Então o gráfico mostra a evolução dentro do dia.
- Dado um período sem vendas, Quando a home carrega, Então o gráfico é exibido vazio, sem erro.

**Regras de negócio**
- A série considera pedidos `pago`, coerente com RF-ANL-02.
- A granularidade acompanha o período selecionado.

> ⚠️ Suposição: o blueprint não define granularidade nem se a série é por faturamento ou por quantidade. Assumida granularidade diária (horária para "Hoje") e série de faturamento.

**Prioridade** — MVP

### RF-ANL-05 — Ranking dos checkouts por faturamento

**Descrição** — O sistema deve exibir na home um ranking rápido dos checkouts com maior faturamento no período.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado um período com vendas em vários checkouts, Quando a home carrega, Então os 3 a 5 checkouts de maior faturamento aparecem ordenados de forma decrescente.
- Dado um checkout no ranking, Quando o usuário o seleciona, Então navega para a página interna dele.
- Dado um período sem vendas, Quando a home carrega, Então o ranking é exibido vazio.

**Regras de negócio**
- Ordenação por faturamento (pedidos `pago`) no período, limitada a 3–5 itens.
- Checkouts excluídos continuam contando no ranking histórico quando tiveram vendas no período.

**Prioridade** — MVP

### RF-ANL-06 — Funil, conversão e abandono do PIX dentro do checkout

**Descrição** — O sistema deve exibir, dentro da página interna de cada checkout, o funil daquele checkout com taxa de conversão e taxa de abandono do PIX.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dada a área de analytics de um checkout, Quando o usuário a abre, Então vê o funil (visitas → PIX gerados → pagos), a taxa de conversão e a taxa de abandono do PIX.
- Dado o usuário na home, Quando consulta os componentes, Então **não** encontra funil, conversão nem abandono do PIX.
- Dado um checkout sem tráfego no período, Quando a área é aberta, Então os indicadores aparecem zerados.

**Regras de negócio**
- Métricas de diagnóstico existem **apenas** dentro do checkout, por decisão explícita do blueprint.
- Taxa de conversão = pedidos pagos / visitas do checkout. Abandono do PIX = pedidos expirados / pedidos gerados.
- Escopo sempre restrito ao checkout aberto.

> ⚠️ Suposição: o blueprint não lista as etapas do funil nem as fórmulas. Assumidas as três etapas e as duas fórmulas acima; contagem de visitas exige registrar acesso à página pública, o que o blueprint não menciona explicitamente.

**Prioridade** — Pós-MVP

---

## CONF — Configurações da conta

### RF-CONF-01 — Editar nome e e-mail da conta

**Descrição** — O sistema deve permitir que o usuário edite o nome e o e-mail da sua conta.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dado a tela de Configurações, Quando o usuário altera o nome e salva, Então o novo nome passa a ser exibido no painel.
- Dado um e-mail em formato inválido, Quando o usuário salva, Então a edição é recusada.
- Dado um e-mail já usado por outra conta, Quando o usuário salva, Então a edição é recusada.

**Regras de negócio**
- Alterar o e-mail de contato não altera a identidade de login, que continua sendo a do Google (RF-AUTH-01).

> ⚠️ Suposição: o blueprint não esclarece se o e-mail editável é o de login ou apenas o de contato. Assumido: **e-mail de contato**, já que o login é exclusivamente Google e não poderia ser trocado por edição de formulário.

**Prioridade** — Pós-MVP

### RF-CONF-02 — CPF/CNPJ bloqueado para edição

**Descrição** — O sistema deve exibir o CPF/CNPJ da conta sem permitir edição, orientando o contato com a equipe para alteração.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dada a tela de Configurações, Quando ela carrega, Então o CPF/CNPJ aparece em modo somente leitura.
- Dado o campo bloqueado, Quando o usuário tenta alterá-lo, Então é orientado a contatar a equipe.
- Dada uma tentativa de alteração por caminho não previsto pela interface, Quando ela chega ao sistema, Então é recusada.

**Regras de negócio**
- O documento definido no onboarding (RF-ONB-02) é imutável pela interface do produto.
- Um botão dedicado de contato com a equipe é cogitado no blueprint, mas não fechado.

**Prioridade** — Pós-MVP

### RF-CONF-03 — Desativar conta

**Descrição** — O sistema deve permitir que o usuário desative a própria conta a partir da danger zone.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dada a danger zone, Quando o usuário aciona "desativar" e confirma, Então a conta é desativada e suas páginas públicas deixam de aceitar novas compras.
- Dada uma conta desativada, Quando o usuário faz login, Então é informado do estado da conta.
- Dada a desativação, Quando existem pedidos pendentes, Então eles seguem para confirmação ou expiração normalmente.

**Regras de negócio**
- Desativação é reversível em relação a exclusão: não apaga dados.
- Exige confirmação explícita, com aviso das consequências.

> ⚠️ Suposição: o blueprint só diz "desativar/deletar conta". Assumido: desativar suspende vendas e acesso sem apagar dados, e é distinto de deletar.

**Prioridade** — Pós-MVP

### RF-CONF-04 — Deletar conta

**Descrição** — O sistema deve permitir que o usuário solicite a exclusão definitiva da conta e dos seus dados.

**Ator** — Usuário autenticado.

**Critérios de aceite**
- Dada a danger zone, Quando o usuário aciona "deletar" e confirma de forma inequívoca, Então a conta é marcada para exclusão e o acesso é encerrado.
- Dada a exclusão, Quando ela é efetivada, Então produtos, ofertas, checkouts, customizações e credenciais de gateway da conta deixam de ser acessíveis e as URLs públicas param de responder.
- Dado o diálogo de exclusão, Quando o usuário cancela, Então nada é alterado.

**Regras de negócio**
- Exclusão exige confirmação forte (mais do que um clique simples) e é irreversível pela interface.
- Dados pessoais do comprador coletados nos pedidos daquela conta entram no mesmo escopo de exclusão, respeitando eventuais obrigações legais de retenção fiscal.

> ⚠️ Suposição: o blueprint não define retenção, prazo de carência nem o destino do histórico de pedidos. Assumida exclusão com possível retenção legal mínima, a ser definida com apoio jurídico.

**Prioridade** — Pós-MVP

---

## Requisitos não funcionais relevantes

- **Multi-tenancy por conta** — a conta é a unidade de isolamento. Todo recurso (produto, oferta, checkout, customização, pixel, gateway, pedido, métrica) pertence a exatamente uma conta, e toda leitura/escrita autenticada é resolvida no escopo da conta do usuário logado.
- **Isolamento de dados** — nenhuma resposta pode revelar existência ou conteúdo de recurso de outra conta; acesso cruzado responde como recurso inexistente. A página pública expõe apenas o necessário para a compra (banner, produto, preço da oferta, customização), nunca dados internos da conta.
- **Idempotência de webhook** — notificações do gateway podem chegar duplicadas ou fora de ordem. O processamento é idempotente por identificador de evento/cobrança: reprocessar não duplica transição de estado, e-mail de entrega nem contagem no analytics.
- **Timezone e moeda** — moeda única BRL, valores em centavos (inteiros) para evitar erro de ponto flutuante; exibição sempre formatada em pt-BR. Todo agrupamento de período no analytics usa America/Sao_Paulo, com armazenamento em UTC.
- **LGPD dos dados do comprador** — nome, e-mail e CPF são dados pessoais coletados para executar a compra e entregar o produto. Consequências: coleta mínima (só os três campos), uso restrito à finalidade (cobrança, entrega, analytics agregado), acesso restrito à conta vendedora, CPF nunca exibido integralmente em telas de listagem, e exclusão dos dados no escopo de RF-CONF-04, respeitando retenção legal.
- **Performance da página pública** — a página pública é a superfície que converte: deve carregar rápido em rede móvel, ser resiliente a picos de tráfego de campanha, e nunca depender de recurso do painel autenticado. Falha em pixel de terceiro (RF-PUB-08) não pode bloquear o carregamento nem a geração do PIX.

---

## Ambiguidades e decisões pendentes

### Deixado em aberto pelo blueprint

1. **Monetização e split de pagamento** — o modelo de cobrança do LowCheckout não está decidido (mensalidade fixa, taxa por transação, taxa fixa por venda, híbrido, tiers). Cobrar por transação depende de o EfiBank suportar split de pagamento, o que ainda não foi confirmado. A oferta de lançamento (taxa zero para os 100 primeiros clientes + 50% de desconto por X meses) depende do modelo base e de regras claras ("o que conta como cliente", duração, sustentabilidade). **Nenhum requisito de faturamento/cobrança do próprio produto foi escrito**, por falta de definição.
2. **Override de campos da oferta** — hoje o override sobre o produto se restringe à URL do entregável (RF-OFER-02). Não está decidido se outros campos (por exemplo, nome de exibição) ganharão o mesmo padrão.
3. **Tutorial guiado** (RF-ONB-03) — marcado como "(Futuro)". Conteúdo, número de passos, gatilho de reabertura e critério de conclusão não definidos.
4. **Geração de JSON de customização via IA** (RF-CHK-11) — marcada como "ideia de diferencial". Não definidos: modelo/provedor, quais dados do produto entram no contexto, custo, limites de uso.

### Divergências entre o código atual e o blueprint

5. **Preço no checkout (contradição)** — o scaffold da API modela `price_in_cents` e `currency` na tabela `checkouts` e um value object `Money` dentro da entidade `Checkout` (`api/src/infra/persistence/drizzle/schema/checkouts.table.ts`, `api/src/domain/checkouts/entities/checkout.entity.ts`). O blueprint coloca o preço na **Oferta**. Este documento segue o blueprint; o scaffold precisa ser refatorado.
6. **`status` do checkout** — o scaffold define `draft | active | paused | archived`, estados que o blueprint não menciona nem descreve transições. Nenhum requisito de publicação/pausa de checkout foi escrito. Decidir se o conceito fica, e com quais regras.
7. **Ausência de conta/tenant no scaffold** — o código atual não tem noção de conta, usuário, produto nem oferta. Todos os requisitos de isolamento assumem que isso será introduzido.
8. **"Nome do negócio" ausente no formulário de onboarding já implementado** — `web/src/features/signup/` coleta tipo de documento, documento, telefone, tipo de produto e faixa de faturamento, mas não o nome do negócio, que o blueprint lista como obrigatório (RF-ONB-02).

### Suposições adotadas neste documento

| # | Requisito | Suposição |
| --- | --- | --- |
| S1 | RF-AUTH-02 | Conta é provisionada automaticamente no primeiro login; 1 usuário por conta no MVP (sem convite de membros). |
| S2 | RF-ONB-02 | O blueprint prevalece sobre a tela já implementada: "nome do negócio" é obrigatório e deve ser adicionado ao formulário. |
| S3 | RF-PROD-01 | No produto, só o nome é obrigatório; descrição, imagem e entregável padrão são opcionais. |
| S4 | RF-PROD-04 / RF-OFER-04 / RF-CHK-04 | Exclusão bloqueada enquanto houver dependências, com histórico de pedidos sempre preservado. |
| S5 | RF-OFER-01 | O nome da oferta é interno; a página pública exibe o nome de exibição do checkout e os dados do produto. |
| S6 | RF-OFER-02 | Entregável obrigatório em pelo menos um dos níveis (oferta ou produto), validado ao salvar a oferta. |
| S7 | RF-CHK-03 | O produto vinculado a um checkout é imutável após a criação. |
| S8 | RF-CHK-05 | A URL pública é um identificador opaco e estável por vínculo checkout+oferta, sem garantia de reuso após desvínculo. |
| S9 | RF-CHK-07 / RF-CHK-08 | Existe um catálogo fixo de propriedades customizáveis; manual e JSON operam sobre o mesmo estado, e a importação é substituição total. |
| S10 | RF-CHK-09 | O preview usa a primeira oferta vinculada, ou um placeholder quando não há nenhuma. |
| S11 | RF-PUB-05 | "Status automático" é comportamento observável; o mecanismo (polling ou push) fica para a etapa técnica. |
| S12 | RF-PUB-07 | A "lembrança" dos dados do comprador é local ao navegador, nunca cross-device nem compartilhada entre compradores. |
| S13 | RF-PUB-08 | Eventos mínimos de pixel: visualização da página, geração do PIX e compra aprovada. |
| S14 | RF-PAG-02 | Pagamento confirmado após a expiração prevalece (`expirado → pago`); precisa ser validado contra o comportamento real do EfiBank. |
| S15 | RF-PAG-03 | O prazo de expiração do PIX é único e definido pelo produto, não configurável pelo usuário. |
| S16 | RF-PAG-06 | O pedido congela valor, identificação comercial, entregável resolvido e dados do comprador — snapshot não mencionado no blueprint. |
| S17 | RF-GTW-04 / RF-GTW-05 | Troca/desconexão de credenciais e validação no momento da conexão são necessárias para operar, embora não estejam no blueprint. |
| S18 | RF-ANL-01 | Período padrão da home = "7 dias"; fuso de referência = America/Sao_Paulo. |
| S19 | RF-ANL-02 | O pedido entra no período pela **data de aprovação** do pagamento, não pela data de criação. |
| S20 | RF-ANL-04 | Gráfico com granularidade diária (horária para "Hoje") e série de faturamento. |
| S21 | RF-ANL-06 | Funil = visitas → PIX gerados → pagos; conversão = pagos/visitas; abandono = expirados/gerados. Exige registrar visitas na página pública. |
| S22 | RF-CONF-01 | O e-mail editável em Configurações é o de **contato**, não o de login (que é do Google e imutável). |
| S23 | RF-CONF-03 | "Desativar" suspende vendas e acesso sem apagar dados; é distinto de "deletar". |
| S24 | RF-CONF-04 | Exclusão de conta remove os dados da conta e dos compradores dela, respeitando retenção legal mínima a definir com apoio jurídico. |
| S25 | Priorização | O fluxo público (PUB) e o pagamento PIX (PAG) foram marcados como MVP: sem eles a "integração com gateway" listada no MVP não produz nenhuma venda. Configurações da conta (CONF) e o funil detalhado (RF-ANL-06) foram marcados como Pós-MVP por não constarem da lista de escopo do MVP. |
