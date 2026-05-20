import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMpCardCharge, getMpPublicKey } from "@/lib/mercadopago.functions";
import { formatBRL, type CheckoutProductKey } from "@/lib/checkout-products";
import type { CheckoutBumps, CheckoutLead } from "@/lib/checkout-storage";
import { readMetaTracking, trackEvent } from "@/lib/meta-pixel";

type InstallmentOption = {
  installments: number;
  installment_amount: number;
  total_amount: number;
  recommended_message: string;
};

type MpInstance = {
  createCardToken: (data: {
    cardNumber: string;
    cardholderName: string;
    cardExpirationMonth: string;
    cardExpirationYear: string;
    securityCode: string;
    identificationType: string;
    identificationNumber: string;
  }) => Promise<{ id: string }>;
  getPaymentMethods: (q: { bin: string }) => Promise<{
    results: Array<{ id: string; payment_type_id: string; issuer?: { id?: string | number } }>;
  }>;
  getInstallments: (q: { amount: string; bin: string; paymentTypeId?: string }) => Promise<
    Array<{
      payer_costs: InstallmentOption[];
    }>
  >;
};

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, opts?: { locale?: string }) => MpInstance;
  }
}

let sdkPromise: Promise<void> | null = null;
function loadMpSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.MercadoPago) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://sdk.mercadopago.com/js/v2";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Falha ao carregar SDK do Mercado Pago."));
    document.head.appendChild(s);
  });
  return sdkPromise;
}

function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}
function formatCardNumber(v: string) {
  return onlyDigits(v)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}
function formatExpiry(v: string) {
  const d = onlyDigits(v).slice(0, 4);
  if (d.length < 3) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export function MpCardForm({
  amountCents,
  productLabel,
  productKey,
  bumps,
  externalReference,
  userId,
  lead,
  onPaid,
}: {
  amountCents: number;
  productLabel: string;
  productKey: CheckoutProductKey;
  bumps: CheckoutBumps;
  externalReference: string;
  userId?: string | null;
  lead: CheckoutLead | null;
  onPaid: () => void;
}) {
  const getKey = useServerFn(getMpPublicKey);
  const chargeFn = useServerFn(createMpCardCharge);

  const mpRef = useRef<MpInstance | null>(null);
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState("");
  const [cardholder, setCardholder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [installments, setInstallments] = useState(1);
  const [installmentOptions, setInstallmentOptions] = useState<InstallmentOption[] | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [issuerId, setIssuerId] = useState<string | undefined>(undefined);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  // Used for productLabel-only display; charge value comes from server.
  void productLabel;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadMpSdk();
        const { publicKey } = await getKey();
        if (cancelled) return;
        if (!window.MercadoPago) throw new Error("SDK MP indisponível.");
        mpRef.current = new window.MercadoPago(publicKey, { locale: "pt-BR" });
        setReady(true);
      } catch (e) {
        if (!cancelled) setInitError(e instanceof Error ? e.message : "Falha ao iniciar.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getKey]);

  // Busca bandeira/issuer e parcelamento reais quando o BIN é completo.
  useEffect(() => {
    if (!ready || !mpRef.current) return;
    const bin = onlyDigits(cardNumber).slice(0, 8);
    if (bin.length < 6) {
      setInstallmentOptions(null);
      setPaymentMethodId("");
      setIssuerId(undefined);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const pm = await mpRef.current!.getPaymentMethods({ bin });
        const card = pm.results.find((r) => r.payment_type_id === "credit_card");
        if (cancelled) return;
        if (!card) {
          setPaymentMethodId("");
          setIssuerId(undefined);
          setInstallmentOptions(null);
          return;
        }
        setPaymentMethodId(card.id);
        const issuer = card.issuer?.id != null ? String(card.issuer.id) : undefined;
        setIssuerId(issuer);

        const amount = (amountCents / 100).toFixed(2);
        const inst = await mpRef.current!.getInstallments({
          amount,
          bin,
          paymentTypeId: "credit_card",
        });
        if (cancelled) return;
        const opts = inst[0]?.payer_costs ?? null;
        setInstallmentOptions(opts);
        if (opts && !opts.find((o) => o.installments === installments)) {
          setInstallments(opts[0]?.installments ?? 1);
        }
      } catch {
        if (!cancelled) setInstallmentOptions(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, cardNumber, amountCents, installments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || !mpRef.current) {
      toast.error("Aguarde carregar o pagamento.");
      return;
    }
    if (!lead) {
      toast.error("Preencha seus dados acima primeiro.");
      return;
    }
    const doc = onlyDigits(lead.cpf ?? "");
    if (doc.length !== 11) {
      toast.error("Informe um CPF válido.");
      return;
    }
    const number = onlyDigits(cardNumber);
    if (number.length < 13) {
      toast.error("Número do cartão inválido.");
      return;
    }
    const [mm, yy] = expiry.split("/");
    if (!mm || !yy || mm.length !== 2 || yy.length !== 2) {
      toast.error("Validade inválida (use MM/AA).");
      return;
    }
    if (cvv.length < 3) {
      toast.error("CVV inválido.");
      return;
    }
    if (cardholder.trim().length < 3) {
      toast.error("Informe o nome impresso no cartão.");
      return;
    }
    if (!paymentMethodId) {
      toast.error("Bandeira do cartão não reconhecida.");
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);
    try {
      const token = await mpRef.current.createCardToken({
        cardNumber: number,
        cardholderName: cardholder.trim(),
        cardExpirationMonth: mm,
        cardExpirationYear: `20${yy}`,
        securityCode: cvv,
        identificationType: "CPF",
        identificationNumber: doc,
      });

      const res = await chargeFn({
        data: {
          productKey,
          bumps,
          externalReference,
          token: token.id,
          paymentMethodId,
          installments,
          issuerId,
          payer: { name: lead.fullName, email: lead.email, document: doc },
          userId: userId ?? undefined,
          tracking: readMetaTracking(),
        },
      });

      if (res.paid) {
        setDone(true);
        setStatusMsg(res.message);
        toast.success("Pagamento aprovado!");
        // Pixel Purchase (browser) — eventID = ID do pagamento p/ dedup com CAPI.
        trackEvent(
          "Purchase",
          {
            value: res.amountCents / 100,
            currency: "BRL",
            content_ids: [productKey],
            content_type: "product",
            order_id: res.id,
          },
          res.id,
        );
        onPaid();
      } else if (res.failed) {
        setStatusMsg(res.message);
        toast.error(res.message);
      } else {
        setStatusMsg(res.message);
        toast.info(res.message);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao processar o pagamento.";
      setStatusMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (initError) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        {initError}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border bg-muted/30 p-4"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <CreditCard className="h-4 w-4" />
        Pagamento com cartão de crédito
      </div>

      <div className="space-y-2">
        <Label htmlFor="mp-card-number">Número do cartão</Label>
        <Input
          id="mp-card-number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mp-card-name">Nome impresso no cartão</Label>
        <Input
          id="mp-card-name"
          autoComplete="cc-name"
          placeholder="Como está no cartão"
          value={cardholder}
          onChange={(e) => setCardholder(e.target.value.toUpperCase())}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="mp-card-exp">Validade</Label>
          <Input
            id="mp-card-exp"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mp-card-cvv">CVV</Label>
          <Input
            id="mp-card-cvv"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            maxLength={4}
            value={cvv}
            onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, 4))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mp-card-installments">Parcelas</Label>
        <select
          id="mp-card-installments"
          value={installments}
          onChange={(e) => setInstallments(Number(e.target.value))}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          disabled={!installmentOptions}
        >
          {installmentOptions
            ? installmentOptions.map((opt) => (
                <option key={opt.installments} value={opt.installments}>
                  {opt.recommended_message ||
                    `${opt.installments}x de ${formatBRL(Math.round(opt.installment_amount * 100))}`}
                </option>
              ))
            : [
                <option key={1} value={1}>
                  1x de {formatBRL(amountCents)}
                </option>,
              ]}
        </select>
        {!installmentOptions && cardNumber.length > 0 && (
          <p className="text-[11px] text-muted-foreground">
            Digite o número completo do cartão para carregar as opções de parcelamento reais (com ou
            sem juros conforme o emissor).
          </p>
        )}
      </div>

      {statusMsg && !done && <p className="text-xs text-destructive">{statusMsg}</p>}

      {done ? (
        <div className="flex items-center justify-center gap-2 text-sm text-primary">
          <CheckCircle2 className="h-5 w-5" />
          Pagamento aprovado! Liberando seu acesso…
        </div>
      ) : (
        <Button type="submit" size="lg" className="w-full" disabled={submitting || !ready}>
          {!ready ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Carregando pagamento…
            </>
          ) : submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando…
            </>
          ) : (
            <>Pagar {formatBRL(amountCents)} no cartão</>
          )}
        </Button>
      )}

      <p className="text-[11px] text-center text-muted-foreground">
        Os dados do cartão são criptografados pelo Mercado Pago e nunca passam pelo nosso servidor.
      </p>
    </form>
  );
}
