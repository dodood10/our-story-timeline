## Problema

`/surprise` mostra tela em branco e o console exibe:
> Invariant failed: Expected to find a match below the root match in SPA mode.

Causa: existem `surprise.index.tsx`, `surprise.quiz.tsx` e `surprise.plan.tsx`, mas **não existe** `surprise.tsx` (o route layout pai). Sem o pai, o TanStack registra o index como `/surprise/` e a URL `/surprise` (sem barra) não casa em SPA mode.

## Correção

1. **Criar `src/routes/surprise.tsx`** — layout mínimo só com `<Outlet />`:
   ```tsx
   import { createFileRoute, Outlet } from "@tanstack/react-router";
   export const Route = createFileRoute("/surprise")({
     component: () => <Outlet />,
   });
   ```
   Isso registra `/surprise` como rota pai. O `surprise.index.tsx` passa a ser o filho que renderiza exatamente em `/surprise`, e `/surprise/quiz` e `/surprise/plan` continuam funcionando.

2. **Não tocar** em `src/routeTree.gen.ts` — é regenerado automaticamente pelo plugin do Vite ao detectar o novo arquivo.

3. **Verificar** após o restart do dev server:
   - `/` carrega a landing.
   - `/surprise` carrega o checkout mock.
   - `/surprise/quiz` e `/surprise/plan` continuam OK.

## Fora de escopo

- Hydration warning do `AppShell` em outras rotas (relacionado ao `useAccess` lendo `localStorage` no SSR vs client). Posso atacar em seguida se quiser, mas não afeta `/surprise` porque `LayoutSwitch` já desvia para o branch marketing nessa URL.
