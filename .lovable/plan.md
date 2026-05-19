## Objetivo

Adicionar **Mercado Pago checkout transparente** (Pix + Cartão) substituindo a SyncPay como gateway principal. O cliente paga sem sair do site, com:

- **Pix**: QR code + copia-e-cola gerados via API do MP, com polling de status.
- **Cartão**: formulário direto na página, tokenização via MP.js no cliente, cobrança server-side com o token.

## O que o usuário precisa fornecer (1 passo)

Duas credenciais do painel Mercado Pago → Suas integrações → Credenciais:

| Secret               | Onde colar        | Uso                       |
| -------------------- | ----------------- | ------------------------- |
| `MP_ACCESS_TOKEN`    | secret do Lovable | Server: criar pagamentos  |
| `VITE_MP_PUBLIC_KEY` | secret do Lovable | Cliente: tokenizar cartão |

Vamos pedir via `add_secret` no início da implementação.

## Arquivos novos

### Server

- **`src/lib/mercadopago.server.ts`** — fetch helpers para `/v1/payments` (POST Pix, POST cartão, GET status). Lê `MP_ACCESS_TOKEN` dentro do handler. Gera `X-Idempotency-Key` por charge.
- **`src/lib/mercadopago.functions.ts`** — 3 server functions:
  - `createMpPixCharge` — payload `{ payment_method_id: "pix", transaction_amount, payer }` → retorna `{ id, qrCode, qrCodeBase64, ticketUrl, status }`.
  - `createMpCardCharge` — payload `{ token, payment_method_id, installments, transaction_amount, payer }` → retorna `{ id, status, statusDetail }`.
  - `getMpPaymentStatus` — GET `/v1/payments/{id}`.
- **`src/routes/api/public/mercadopago-webhook.ts`** — recebe notificações IPN/Webhook do MP (`type=payment`), busca o pagamento na API e loga. Sem dependência crítica (frontend libera via polling).

### Cliente

- **`src/components/checkout/MpCardForm.tsx`** — formulário cartão (número, titular, validade, CVV, parcelas, doc). Carrega o MP.js dinamicamente (`https://sdk.mercadopago.com/js/v2`), cria `cardToken` via `mp.createCardToken(...)`, chama `createMpCardCharge`, mostra estados (aprovado / pendente / recusado com `status_detail` traduzido).
- **`src/components/checkout/MpPixDialog.tsx`** — análogo ao `PixPaymentDialog` atual, mas chamando `createMpPixCharge` + `getMpPaymentStatus`. Usa `qrCodeBase64` direto do MP (não precisa gerar QR no cliente).

### Substituições / edições

- **`src/components/checkout/PaymentMethodTabs.tsx`** — reativar opção Cartão. Duas tabs: Pix (instantâneo, 5% desc opcional) / Cartão (até 12x).
- **`src/components/checkout/CheckoutFormColumn.tsx`**:
  - CPF continua obrigatório (MP exige para Pix; recomendado para cartão).
  - No submit, abrir `MpPixDialog` ou expandir o `MpCardForm` conforme `paymentMethod`.
  - Remover import do `PixPaymentDialog` (SyncPay) e substituir.
- **`src/routes/surprise.index.tsx`** e **`src/routes/memory-lane.index.tsx`** — sem mudança de assinatura; só a UI interna troca.

### Limpeza

- Manter `syncpay.*` no projeto por enquanto, mas **desconectado**. Deletar imports apenas; arquivos ficam órfãos para rollback rápido. (Posso remover de vez se preferir.)

## Detalhes técnicos importantes

**Idempotency-Key**: MP exige header `X-Idempotency-Key` único por charge para evitar duplicação em retry. Geramos `crypto.randomUUID()` por request.

**Valor**: `transaction_amount` em reais com 2 casas (ex.: `31.70`), não centavos.

**Pix payer**: `{ email, first_name, last_name, identification: { type: "CPF", number } }`.

**Cartão response**: `status` pode ser `approved`, `in_process`, `rejected`. `status_detail` dá motivo (ex.: `cc_rejected_insufficient_amount`). Mapear ~10 códigos comuns para mensagens em PT-BR.

**Tokenização cartão**: nunca enviar PAN/CVV para nosso server. MP.js gera token no browser usando `VITE_MP_PUBLIC_KEY`; mandamos só o token + dados públicos.

**Webhook**: URL pública estável `https://memory-lane.life/api/public/mercadopago-webhook`. Configurar no painel MP → Suas integrações → Webhooks → eventos `payment`. Validação por busca na API (não há HMAC nativo).

**Parcelas**: começar fixo em 1x sem juros. Adicionar seletor 1-12x depois se quiser.

## Fluxo do usuário

```text
Preenche dados → escolhe Pix ou Cartão
  ├─ Pix → modal com QR + copia-e-cola → polling 3s → libera acesso
  └─ Cartão → formulário inline → tokeniza → cobra → toast aprovado → libera acesso
```

## Verificação

1. Credenciais TEST do MP → simular Pix com cartão de teste (`APRO`/`OTHE`/`CONT`).
2. Conferir log do webhook recebendo evento `payment`.
3. Trocar para credenciais PROD e validar com pagamento real de R$ 0,50.
