# LowCheckout — Blueprint do Projeto

## Visão do produto
Checkout as a service — cuida apenas da camada visual e funcional do checkout, sem processar pagamento diretamente (usuário conecta seu próprio gateway). Marketing usa "low ticket" como posicionamento, mas o produto é construído como um checkout completo e competitivo, com taxas baixas e funcionalidades robustas, para rivalizar com qualquer checkout transparente do mercado (não só um nicho).

---

## Módulos

### 1. Autenticação
- Login exclusivamente via Google (sem email/senha)
- Onboarding de conta pós primeiro login (bloqueante):
  - Obrigatórios: nome do negócio, CPF/CNPJ, telefone
  - Opcionais: o que vende, faturamento estimado
- (Futuro) Onboarding de tutorial guiado

### 2. Produto
- Nome, descrição (opcional), URL da imagem, URL do entregável (padrão)

### 3. Oferta
- Variação comercial de um produto: nome (uso interno), valor, URL do entregável (opcional, com fallback pro produto)
- Vínculo com checkout é manual — nenhuma oferta entra automaticamente em checkouts existentes
- Um produto pode ter N ofertas; um mesmo produto pode ser reutilizado em vários checkouts

### 4. Checkout
- **Criação:** título (interno), nome de exibição (título da página + footer), URL do banner (desktop/mobile)
- **Página interna:** analytics (funil deste checkout), produtos+ofertas vinculadas, tracking/pixels, builder
- **Builder:** customização manual (inputs de cor etc.) + customização via JSON — botão "Customizar via JSON" abre popup com guia + editor, botão "Importar" com confirmação de sobrescrita da customização atual. Preview lado a lado (toggle desktop/mobile)
- Um checkout pertence a um produto e pode expor múltiplas ofertas (1 URL pública por oferta)
- Ideia de diferencial: gerar o JSON de customização via IA, usando contexto do produto

### 5. Analytics geral (Home)
- Seletor de período único (Hoje / 7 dias / 30 dias / Personalizado) controlando toda a tela
- Conteúdo: faturamento do período, ticket médio, cards de vendas (aprovadas/pendentes/expiradas), gráfico de vendas ao longo do período, ranking rápido dos checkouts (top 3-5 por faturamento)
- Métricas de diagnóstico (funil detalhado, taxa de conversão, taxa de abandono do PIX) ficam só dentro da página de cada checkout, não na home

### 6. Página pública (fluxo do comprador)
1. **Página do checkout** — banner, produto/oferta, preço, campos (nome, e-mail, CPF — todos obrigatórios), botão gerar PIX
2. **Tela do PIX** — QR Code, copia-e-cola, timer de expiração, status automático (aguardando → pago)
3. **Tela de obrigado** — confirmação, acesso ao entregável, aviso de que também foi enviado por e-mail
- Comprador não tem painel/conta — dados servem no máximo para "lembrança" em compras futuras

### 7. Gateway
- Página própria e separada (não faz parte de Configurações da conta)
- Configurado a nível de conta (global) — conecta uma vez, todo checkout herda
- Primeiro provider: EfiBank (PIX)
- Tracking/Pixels (Facebook, Utmify), por outro lado, é configurado a nível de cada checkout — pois cada checkout normalmente representa uma campanha/oferta diferente

### 8. Configurações da conta
- Edição de nome e e-mail
- CPF/CNPJ bloqueado para edição (requer contato com a equipe — talvez com botão dedicado)
- Danger zone: desativar/deletar conta

---

## Escopo do MVP (produto próprio de teste)
Analytics básico, criação de produtos, criação de checkout, configuração de pixel (Facebook e Utmify), integração com gateway, customização básica do checkout (incluindo upload de JSON).

---

## Em aberto / não decidido ainda

**Monetização (discussão em andamento):**
- Sem processar pagamento diretamente, cobrar taxa por transação depende de o gateway suportar split de pagamento (marketplace) — ainda não confirmado se o EfiBank oferece isso
- Modelos cogitados: mensalidade fixa, taxa por transação (%), taxa fixa por venda, híbrido (mensalidade + taxa reduzida), tiers por volume/funcionalidade
- Ideia de lançamento cogitada: taxa zero para os primeiros 100 clientes + 50% de desconto na mensalidade por X meses (marketing agressivo) — depende de decidir o modelo base antes, e de definir regras claras (o que conta como "cliente", duração exata do benefício, sustentabilidade de caixa)
- Próximo passo sugerido: pesquisar se o EfiBank suporta split de pagamento, o que ajuda a decidir entre os modelos

**Outros pontos em aberto:**
- Override de campos da oferta está restrito à URL do entregável por enquanto — não decidido se outros campos (ex: nome de exibição) vão ganhar esse padrão futuramente
