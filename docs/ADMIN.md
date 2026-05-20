# Admin backoffice

Rota: `/admin` (requer login + role admin no Supabase).

## Conceder role admin

No Dashboard Supabase → **Authentication** → **Users** → usuário → **Edit user** → **Raw App Meta Data**:

```json
{ "role": "admin" }
```

Ou via SQL (service role / SQL Editor):

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'seu@email.com';
```

O usuário precisa **sair e entrar** (ou refresh da sessão) para o JWT refletir `app_metadata` no cliente.

## Migration

```bash
npm run supabase:apply-auth
```

Inclui a tabela `admin_audit_log` (migration `20260521120000_admin_audit_log.sql`).

## Funcionalidades MVP

- **Dashboard:** vendas 7d, surpresas ativas, Memory Lane ativos, pagamentos sem `user_id`
- **Usuários:** busca por e-mail, ajuste de tier / assinatura, revogar acesso, sincronizar pagamentos
- **Pagamentos:** lista com filtros, revogar acesso por produto após reembolso

Ver também [REFUND.md](./REFUND.md) para fluxo de estorno Mercado Pago.
