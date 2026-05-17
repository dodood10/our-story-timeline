# Gerador de Surpresa Romântica — Produto de entrada

Adicionar um novo produto independente que serve como funil de venda. Memory Lane atual fica como "plano completo" bloqueado. Pagamento e auth ficam mockados nesta fase (testar primeiro).

## Arquitetura de acesso (mock por enquanto)

Sem auth, sem checkout. Estado em `localStorage`:
- `access.surprise` = `none | basic | premium` — controla acesso ao gerador
- `access.full` = `boolean` — desbloqueia Memory Lane (timeline, mem, cartas, bucket, mapa…)

Helper `useAccess()` em `src/hooks/useAccess.ts` + página oculta `/dev-unlock` com botões para simular compras (basic, premium, full, reset). Quando integrar Stripe/Kiwify depois, basta trocar a fonte do estado.

## Novas rotas

```
src/routes/
  index.tsx                  -> SUBSTITUI: vira a landing de venda
  app.tsx                    -> layout: redireciona p/ / se !access.full
  app.index.tsx              -> hoje atual (Hero + OnThisDay)
  app.timeline.tsx           -> move src/routes/timeline.tsx
  app.gallery.tsx, app.bucket-list.tsx, app.letters.tsx,
  app.milestones.tsx, app.map.tsx, app.stats.tsx,
  app.gift-ideas.tsx, app.settings.tsx
  surprise.tsx               -> layout do produto (checa access.surprise)
  surprise.index.tsx         -> intro/checkout mock (botão "Já paguei → desbloquear")
  surprise.quiz.tsx          -> quiz multi-step
  surprise.plan.tsx          -> resultado gerado pela IA + exportar PDF
  dev-unlock.tsx             -> simulador de compras (apenas dev)
```

AppSidebar muda: na home `/` mostra só CTA do produto; dentro de `/app/*` mostra nav atual (atrás de `access.full`).

## 1. Landing `/` (substitui home atual)

Seções com Framer Motion:
1. **Hero** — headline, subheadline, CTA "Criar minha surpresa agora" → `/surprise`
2. **Dor** — 5 bullets ("sem ideia", "restaurante caro"…)
3. **Solução** — como funciona em 3 passos (quiz → IA → plano pronto)
4. **O que recebe** — grid de 7 cards (decoração, lista, passo a passo, roteiro, frases, jantar, emergência 1h)
5. **Prova social mock** — 3 depoimentos placeholder
6. **Preços** — 2 cards (Básico R$10 / Premium R$19,90 destacado), CTA cada
7. **FAQ** — accordion 5 perguntas
8. **CTA final**

SEO: `head()` com title/description/og otimizados para "surpresa dia dos namorados".

## 2. Quiz `/surprise/quiz`

6 perguntas (uma por tela, com barra de progresso), botões grandes tipo card:
- Para quem (namorada/namorado/esposa/marido/ficante/noivo)
- Onde (quarto/sala/mesa/varanda/hotel/casa toda)
- Orçamento (≤50/≤100/≤200/caprichar)
- Estilo (fofo/elegante/sensual/simples/pinterest/pedido)
- Tempo disponível (30min/1h/2h/dia todo/antecedência)
- O que o casal gosta (multi-select: filme, jantar, música, fotos, cartas, vinho, doces, massagem, surpresa quarto)

Estado em `useState` + persistido em `localStorage` `surprise.answers`. Botão final "Gerar meu plano" → server fn → `/surprise/plan`.

## 3. Geração com IA (Lovable AI Gateway)

Server function `src/lib/surprise.functions.ts`:
- `generateSurprisePlan` com `createServerFn({ method: "POST" })`
- inputValidator com Zod (todas respostas do quiz + tier basic/premium)
- handler chama `streamText`/`generateText` via `@ai-sdk/openai-compatible` no gateway Lovable, modelo `google/gemini-3-flash-preview`
- usa `Output.object()` com schema Zod para retornar JSON estruturado:

```
{
  concept: string,
  decoration: { setup: string[], lighting: string, photos: string, avoid: string[] },
  shopping: { essential: string[], optional: string[] },
  timeline: { time: string, task: string }[],
  nightScript: string[],
  romanticPhrases: string[],     // só premium
  dinnerIdeas: string[],          // só premium
  emergencyPlan: string[],        // só premium
  checklist: string[]             // só premium
}
```

Prompt em PT-BR, sistema reforça: tom romântico brasileiro, considerar orçamento real, sem clichês. Resposta cacheada em localStorage `surprise.plan` para evitar regerar.

Requer `LOVABLE_API_KEY` (já existe nos secrets ✓). Helper `src/lib/ai-gateway.ts` com `createLovableAiGatewayProvider`.

Tratamento de erro: 429 / 402 / falha → toast + botão "Tentar novamente".

## 4. Resultado `/surprise/plan`

Layout tipo "magazine":
- Header com nome do plano e badge (Básico/Premium)
- Seções acordeoadas/cards: Conceito, Decoração, Lista de compras (com checkboxes salvos em localStorage), Passo a passo (timeline visual), Roteiro da noite
- **Bloqueado para Básico** (com overlay "Disponível no Premium"): Frases românticas, Ideias de jantar, Plano emergência 1h, Checklist
- Botões: "Copiar tudo", "Baixar PDF", "Refazer quiz"

PDF: lib `jspdf` + `html2canvas` (puro client, compatível com Worker). Botão dispara render do template e download.

## 5. Bloqueio do app atual

`src/routes/app.tsx` (layout):
- Se `!access.full` → mostra paywall com CTA "Desbloquear app completo" (mock por agora)
- Senão renderiza `<Outlet />`

`AppSidebar` só aparece dentro de `/app/*`. Na landing e no produto Valentine's, header minimalista próprio.

Redirects: links antigos `/timeline`, `/gallery`, etc → `/app/timeline`. Atualiza tudo em busca por `to="/timeline"` etc.

## 6. Design

- Manter tokens existentes em `src/styles.css` (paleta rose/romântica)
- Landing usa hero com imagem gerada (casal silhueta, velas) — `imagegen` premium
- Tipografia atual já é display + sans, mantém
- Botões CTA em gradient primary→primary-glow já definidos

## 7. Detalhes técnicos

- Adicionar deps: `jspdf`, `html2canvas`, `@ai-sdk/openai-compatible`, `ai`, `zod` (verificar se já existem)
- `src/start.ts` já ok, não precisa middleware (sem auth)
- Atualizar `src/lib/storage.ts` com novas chaves
- `head()` SEO em todas rotas públicas
- Mobile-first: quiz com botões grandes, plano com tabs em mobile

## 8. Fora de escopo (próxima fase)

- Integração real de checkout (Stripe/Kiwify/Mercado Pago)
- Sistema de auth (e-mail/senha)
- Webhook de liberação automática
- Envio de e-mail de boas-vindas
- Painel admin de vendas

Quando você quiser integrar, substituímos só a fonte do `useAccess()` por consulta a Supabase `purchases` + sessão real.

---

**Próximo passo após aprovação:** implemento landing + quiz + geração IA + resultado + bloqueio do app, tudo com mocks de acesso. Você testa o fluxo completo e, quando aprovar, conectamos pagamento e auth.