# Configuração Supabase Auth

Execute no Dashboard do projeto (`hscoblnnvlynrlyhhocm`) **antes** de testar login em produção.

## Providers

1. **Authentication → Providers → Email**: habilitar Email.
2. **Confirm email**: em dev pode desativar; em produção, manter ativo.

## URLs

**Authentication → URL Configuration**

| Campo         | Valor (dev)                           | Valor (produção)                    |
| ------------- | ------------------------------------- | ----------------------------------- |
| Site URL      | `http://localhost:5173`               | `https://SEU_DOMINIO`               |
| Redirect URLs | `http://localhost:5173/auth/callback` | `https://SEU_DOMINIO/auth/callback` |

## E-mail (PT-BR)

Em **Authentication → Email Templates**, ajustar assuntos/corpos de:

- Confirmação de cadastro — incluir link para `/surprise/quiz` após compra
- Recuperação de senha
- Magic link (opcional)

Após pagamento, o cliente deve usar o **mesmo e-mail** da conta em `/auth/recover-access` se trocar de dispositivo.

## Variáveis de ambiente

Ver [`.env.example`](../.env.example): `VITE_SUPABASE_*` no cliente; `SUPABASE_SERVICE_ROLE_KEY` no servidor (webhook + entitlements).

## Migration

```bash
npm run supabase:apply
```
