# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # start dev server (Vite)
npm run build            # production build
npm run lint             # ESLint
npm run format           # Prettier
npm run typecheck        # tsc --noEmit
npm run test             # Vitest
npm run supabase:apply   # migrations payments + sync
npm run supabase:apply-auth  # auth, entitlements, workspaces
npm run supabase:check-auth  # validate schema
npm run deploy           # build + Cloudflare Workers
```

See [docs/GO-LIVE.md](docs/GO-LIVE.md) for production checklist.

## Architecture

**TanStack Start** (React 19 + Vite + TanStack Router), TypeScript, Tailwind CSS v4, Brazilian Portuguese.

### Two product areas

**Memory Lane** (`/app`, `/timeline`, …) — couples' journal. Data in `localStorage` + photos in IndexedDB (`idb:KEY`). Optional cloud sync via **workspace** (`workspace-sync.ts`).

**Romantic Surprise** (`/`, `/surprise/*`) — funnel + AI plan. Checkout **Mercado Pago** (Pix + card). Plan via `generateSurprisePlan` (Gemini via Lovable gateway).

### Access control (production)

- **Supabase Auth** — `/auth/login`, `/auth/signup`, `/auth/recover-access`
- **`user_entitlements`** — `surprise_tier`, `subscription` (JSON)
- **`useAccess`** — server entitlements when logged in; `localStorage` fallback only without Supabase
- **Payments** — webhook + `grantEntitlementsFromPayment`; checkout uses `u:{userId}|…` external reference
- **`generateSurprisePlan`** — `requireSurprisePlanAccess` middleware when Supabase configured on server

Memory Lane billing: **30-day prepaid access** (single MP payment), not auto-renewing subscription. See `memory-lane-subscription.ts`.

### Layout

`__root.tsx` → marketing routes (bare) vs `AppShell` (sidebar + `RequireAuth` when Supabase configured). Paywall uses `canUseMemoryLane` / `hasAnyProduct`.

### AI

`LOVABLE_API_KEY` on server. Model: `google/gemini-3-flash-preview`.

### Deploy

Cloudflare Workers — set secrets: `LOVABLE_API_KEY`, `MP_*`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_*` at build time.
