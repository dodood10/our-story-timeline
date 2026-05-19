# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Vite)
npm run build      # production build
npm run lint       # ESLint
npm run format     # Prettier
```

No test suite is configured. Type-check with `tsc --noEmit` (not in scripts, run manually).

## Architecture

This is a **TanStack Start** (React 19 + Vite + TanStack Router) app written in TypeScript with Tailwind CSS v4. The app is in Brazilian Portuguese.

### Two distinct product areas

**Memory Lane** (`/app`, `/timeline`, `/gallery`, `/letters`, `/map`, etc.) — a couples' memory journal. All data lives client-side: couple profile, memories, bucket list, and letters are stored in `localStorage` via the `useLocalStorage` hook; photos are stored in IndexedDB via `idb-keyval` and referenced in memories as `"idb:KEY"` strings (resolved at render time via `src/lib/photos.ts`).

**Romantic Surprise** (`/`, `/surprise/*`) — a marketing funnel + AI plan generator. The landing page (`/`) leads to a purchase flow (`/surprise/`), then a quiz (`/surprise/quiz`), and finally a generated plan (`/surprise/plan`). Plan generation is a TanStack server function in `src/lib/surprise.functions.ts` that calls Google Gemini via the Lovable AI Gateway.

### Routing and layout split

File-based routes live in `src/routes/`. The router plugin auto-generates `src/routeTree.gen.ts` — never edit it manually.

`__root.tsx` contains `LayoutSwitch`, which routes by pathname prefix:

- Paths starting with `/`, `/surprise`, or `/dev-unlock` → bare layout (no sidebar)
- Everything else → `AppShell` (sidebar + bottom bar + paywall guard)

`AppShell` checks `useAccess().full` before rendering the app. If `full` is false, it renders `FullAppPaywall`.

### Access control (mocked)

`src/hooks/useAccess.ts` manages two localStorage keys:

- `ml.access.surprise` — `"none" | "basic" | "premium"` — controls which surprise features are available
- `ml.access.full` — `MemoryLaneSubscription | null` (historicamente um boolean; o parser em `src/lib/memory-lane-subscription.ts` migra `true` para uma assinatura ativa).

Memory Lane é uma **assinatura mensal mockada** de R$ 29,90/mês (`SUBSCRIPTION_PRICE_CENTS`, período de 30 dias). O ciclo de vida vive em `src/lib/memory-lane-subscription.ts`:

- `startSubscription()` cria uma nova com período de 30 dias.
- `cancelSubscription()` mantém acesso até `currentPeriodEnd` e desliga `autoRenew`.
- `reactivateSubscription()` religa `autoRenew`.
- `tickSubscription()` simula o webhook do gateway: na hidratação do `useAccess` ele renova quem estiver `autoRenew=true` e vencido, e descarta quem está vencido sem renovação automática (estado `lapsed`).
- UI estados expostos: `active`, `canceling`, `lapsed`, `none` (via `deriveSubscriptionUiState`).

Checkout é simulado (`src/routes/memory-lane.index.tsx` para a compra, `src/routes/settings.tsx` para gerenciar). Use `/dev-unlock` durante o desenvolvimento para alternar estados de acesso, simular renovação/expiração/cancelamento. Pagamento real (Stripe / Mercado Pago) ainda não implementado.

### Global state

`AppProvider` (`src/hooks/useApp.tsx`) wraps the entire app and exposes all Memory Lane data via the `useApp()` hook. It manages couple profile, memories, bucket list, letters, gift favorites, and settings — all persisted to localStorage.

### AI integration

Server function `generateSurprisePlan` in `src/lib/surprise.functions.ts` uses `@ai-sdk/openai-compatible` through `https://ai.gateway.lovable.dev/v1` with model `google/gemini-3-flash-preview`. Requires `LOVABLE_API_KEY` in the server environment (copy from `.env.example`). For Cloudflare Workers deploy, set the secret in the dashboard: Workers → seu worker → Settings → Variables → `LOVABLE_API_KEY`.

### Optional Supabase sync

`src/lib/sync.ts` implements cross-device sync via Supabase (`couple_syncs` table, keyed by a user-generated code). The Supabase client is in `src/integrations/supabase/client.ts`. Sync is opt-in and configured via `settings.syncCode`.

### Themes

Three CSS themes: `theme-romantic`, `theme-minimal`, `theme-modern`. Applied as a class on `<html>`. A blocking inline script in `RootShell` reads `localStorage` and sets the class before paint to avoid a flash.
