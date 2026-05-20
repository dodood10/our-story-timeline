# Programa de afiliados

## Atribuição

- **Last-touch:** o último `?ref=CODIGO` válido na URL ganha (janela de **30 dias** em `localStorage`).
- Link de divulgação: `https://SEU_DOMINIO/?ref=CODIGO` ou `https://SEU_DOMINIO/r/CODIGO`.

## Comissão

- Taxa por afiliado (`commission_rate`, ex.: 0.30 = 30%).
- Conversão criada no webhook Mercado Pago com status `pending`.
- Após **7 dias** (garantia de reembolso), admin aprova (`approved`) e depois marca `paid` ao pagar Pix manualmente.

## Anti-fraude

- Compra com o mesmo e-mail do afiliado não gera comissão.
- Reembolso / revogação no `/admin` marca conversão como `reversed`.

## Onboarding afiliado

1. Admin cria afiliado em `/admin/affiliates` (código, e-mail, %).
2. Afiliado cria conta com o **mesmo e-mail** e acessa `/affiliate`.
3. Admin vincula `user_id` no detalhe ou usa “Vincular por e-mail” se login já existir.

## Migration

```bash
npm run supabase:apply-auth
```

Inclui `20260522120000_affiliates.sql`.
