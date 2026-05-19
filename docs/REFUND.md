# Reembolso (garantia 7 dias)

Processo operacional até automação completa.

## 1. Confirmar compra

No Supabase → `payments`: buscar por `payer_email` ou `external_reference`.

## 2. Estornar no Mercado Pago

Painel MP → Atividade → localizar pagamento → **Reembolsar total**.

## 3. Revogar acesso

No SQL Editor (service role) ou script admin:

```sql
update public.user_entitlements
set surprise_tier = 'none', subscription = null, updated_at = now()
where user_id = '<uuid do usuário>';
```

Para Surpresa apenas, zere `surprise_tier`. Para Memory Lane, zere `subscription`.

## 4. Responder ao cliente

Confirmar estorno em até 5–10 dias úteis (prazo do emissor do cartão / Pix).

## Futuro (código)

- Server fn `revokeEntitlementsForPayment(paymentId)` chamada após estorno manual
- Webhook MP `refunded` para revogar automaticamente
