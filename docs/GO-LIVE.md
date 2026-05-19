# Checklist de go-live (produção)

Execute na ordem antes de abrir tráfego pago.

## 1. Supabase

```bash
npm run supabase:apply      # migrations payments + sync
npm run supabase:apply-auth # auth, entitlements, workspaces
npm run supabase:check-auth # validar tabelas
```

Dashboard: [supabase/AUTH_SETUP.md](../supabase/AUTH_SETUP.md) — Site URL, redirect `/auth/callback`, templates PT-BR.

## 2. Variáveis (Cloudflare Worker + build Vite)

| Variável                        | Onde                                                 |
| ------------------------------- | ---------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Build                                                |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Build                                                |
| `SUPABASE_SERVICE_ROLE_KEY`     | Worker (nunca no cliente)                            |
| `LOVABLE_API_KEY`               | Worker                                               |
| `MP_ACCESS_TOKEN`               | Worker                                               |
| `MP_PUBLIC_KEY`                 | Worker (ou `VITE_MP_PUBLIC_KEY` se usado no cliente) |
| `MP_WEBHOOK_SECRET`             | Worker (**obrigatório** em produção)                 |

## 3. Mercado Pago

- Credenciais de **produção**
- Webhook: `POST https://SEU_DOMINIO/api/public/mercadopago-webhook`
- Eventos: `payment`
- Definir `MP_WEBHOOK_SECRET` no painel MP

## 4. Deploy

```bash
npm run typecheck
npm run test
npm run build
npm run deploy
```

## 5. Smoke test

1. Criar conta em `/auth/signup`
2. Checkout Surpresa (Pix ou cartão teste)
3. Webhook recebe evento → `user_entitlements` atualizado
4. `/surprise/quiz` → `/surprise/plan` gera plano
5. Logout + login no mesmo e-mail → acesso mantido
6. `/auth/recover-access` com e-mail da compra

## 6. Suporte

- Reembolso 7 dias: processo em [docs/REFUND.md](./REFUND.md)
- Recuperação: `/auth/recover-access`
