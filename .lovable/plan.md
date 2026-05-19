## Diagnóstico

Pelos logs de produção, a resposta real do `POST /api/partner/v1/cash-in` da SyncPay é:

```json
{
  "message": "Cashin request successfully submitted",
  "pix_code": "00020126850014br.gov.bcb.pix...6304ABCD",
  "identifier": "2d9b6c45-4401-4414-a7e1-047f887ba9be"
}
```

Dois problemas:

1. Nosso parser procura `paymentCode`/`pix_copia_e_cola`/`brcode` — mas o campo real é `pix_code`. ID é `identifier`, não `id`.
2. A SyncPay **não devolve o QR em base64**. Só o texto EMV (copia-e-cola). Hoje o dialog tenta exibir `<img src="data:image/png;base64,...">` e fica vazio.

## Correções

### 1. `src/lib/syncpay.server.ts`
- Adicionar `pix_code` à lista de chaves do `paymentCode`.
- Adicionar `identifier` à lista de chaves do `id`.
- Quando `paymentCodeBase64` vier vazio (caso atual), devolver string vazia mesmo — o cliente gera o QR.
- No `getSyncPayStatus`, usar o `identifier` na URL: `/api/partner/v1/cash-in/{identifier}` (confirmar pelo log do próximo polling; se 404, alternar para `/transactions/{identifier}` ou query `?identifier=`).

### 2. `src/components/checkout/PixPaymentDialog.tsx`
- Quando `paymentCodeBase64` estiver vazio, renderizar o QR no cliente a partir do `paymentCode` usando a lib `qrcode` (já leve, ~15kb) com `<canvas>` ou `toDataURL`.
- Manter fallback: se gerar QR falhar, mostrar só o copia-e-cola com destaque.

### 3. Polling de status
- Após gerar a cobrança real, observar nos logs qual o shape da resposta de status (campos `status`, `paid_at`, etc.) e ajustar `isPaidStatus` se a SyncPay usar termos diferentes (ex.: `PAID`, `AUTHORIZED`).

## Detalhes técnicos

- Instalar `qrcode` (`bun add qrcode @types/qrcode`).
- Gerar o QR num `useEffect` quando `charge.paymentCode` chegar, salvando o data URL em estado local.
- Tamanho 224×224, margem 1, nível de correção M — combina com o slot atual de 56×56 (`h-56 w-56`).
- O webhook continua só para auditoria; nada muda no `/api/public/syncpay-webhook`.

## Verificação

1. Abrir o checkout, gerar Pix → QR aparece + copia-e-cola funcional.
2. Pagar o Pix → polling detecta `paid` em ≤3s e libera acesso.
3. Conferir log `[syncpay]` — não deve mais aparecer "resposta sem código Pix".
