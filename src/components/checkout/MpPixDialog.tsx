import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Copy, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  createMpPixCharge,
  getMpPaymentStatus,
  type MpPixResponse,
} from "@/lib/mercadopago.functions";
import { formatBRL, type CheckoutProductKey } from "@/lib/checkout-products";
import type { CheckoutBumps, CheckoutLead } from "@/lib/checkout-storage";
import { clearPendingMpPayment, writePendingMpPayment } from "@/lib/checkout-storage";
import { readMetaTracking, trackEvent } from "@/lib/meta-pixel";

type Stage = "loading" | "awaiting" | "paid" | "expired" | "error";

export function MpPixDialog({
  open,
  onOpenChange,
  amountCents,
  productLabel,
  productKey,
  bumps,
  lead,
  externalReference,
  userId,
  onPaid,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amountCents: number;
  productLabel: string;
  productKey: CheckoutProductKey;
  bumps: CheckoutBumps;
  lead: CheckoutLead | null;
  externalReference: string;
  userId?: string | null;
  onPaid: () => void;
}) {
  const createFn = useServerFn(createMpPixCharge);
  const statusFn = useServerFn(getMpPaymentStatus);

  const [stage, setStage] = useState<Stage>("loading");
  const [error, setError] = useState<string | null>(null);
  const [charge, setCharge] = useState<MpPixResponse | null>(null);
  const startedRef = useRef(false);
  const [regenToken, setRegenToken] = useState(0);

  useEffect(() => {
    if (!open) {
      startedRef.current = false;
      setStage("loading");
      setError(null);
      setCharge(null);
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;

    if (!lead) {
      setStage("error");
      setError("Preencha seus dados antes de gerar o Pix.");
      return;
    }
    const doc = (lead.cpf ?? "").replace(/\D/g, "");
    if (doc.length !== 11) {
      setStage("error");
      setError("Informe um CPF válido para gerar o Pix.");
      return;
    }

    const ref = regenToken === 0 ? externalReference : `${externalReference}-r${regenToken}`;
    createFn({
      data: {
        productKey,
        bumps,
        externalReference: ref,
        payer: { name: lead.fullName, email: lead.email, document: doc },
        userId: userId ?? undefined,
        tracking: readMetaTracking(),
      },
    })
      .then((res) => {
        setCharge(res);
        setStage("awaiting");
        // Persiste para reconciliação caso o usuário feche a aba.
        writePendingMpPayment({ externalReference: ref, productKey });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Falha ao gerar o Pix.");
        setStage("error");
      });
  }, [open, productKey, bumps, externalReference, lead, createFn, regenToken, userId]);

  useEffect(() => {
    if (stage !== "awaiting" || !charge?.id) return;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 200; // ~10 min

    async function tick() {
      if (cancelled) return;
      attempts += 1;
      try {
        const res = await statusFn({ data: { id: charge!.id } });
        if (cancelled) return;
        if (res.paid) {
          setStage("paid");
          clearPendingMpPayment();
          // Pixel Purchase (browser) — eventID = ID do pagamento p/ dedup com CAPI.
          trackEvent(
            "Purchase",
            {
              value: amountCents / 100,
              currency: "BRL",
              content_ids: [productKey],
              content_type: "product",
              order_id: charge!.id,
            },
            charge!.id,
          );
          onPaid();
          return;
        }
        if (res.failed) {
          setStage("error");
          setError("O pagamento foi recusado ou expirou. Tente novamente.");
          return;
        }
      } catch {
        /* tenta de novo */
      }
      if (attempts >= maxAttempts) {
        if (!cancelled) setStage("expired");
        return;
      }
      setTimeout(tick, 3000);
    }
    const t = setTimeout(tick, 3000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [stage, charge?.id, statusFn, onPaid]);

  function copyCode() {
    if (!charge?.qrCode) return;
    navigator.clipboard
      .writeText(charge.qrCode)
      .then(() => toast.success("Código Pix copiado!"))
      .catch(() => toast.error("Não foi possível copiar."));
  }

  function regenerate() {
    startedRef.current = false;
    setCharge(null);
    setError(null);
    setStage("loading");
    setRegenToken((t) => t + 1);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pague com Pix para liberar o acesso</DialogTitle>
          <DialogDescription>
            {productLabel} — <strong>{formatBRL(amountCents)}</strong>
          </DialogDescription>
        </DialogHeader>

        {stage === "loading" && (
          <div className="py-10 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Gerando seu Pix com segurança…</p>
          </div>
        )}

        {stage === "awaiting" && charge && (
          <div className="space-y-4">
            {charge.qrCodeBase64 && (
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${charge.qrCodeBase64}`}
                  alt="QR Code Pix"
                  className="h-56 w-56 rounded-lg border border-border bg-white p-2"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Ou copie e cole no seu app do banco
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={charge.qrCode}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 min-w-0 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-mono"
                />
                <Button type="button" variant="outline" size="sm" onClick={copyCode}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Aguardando confirmação do pagamento…
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Esta janela atualiza automaticamente assim que o Pix for confirmado.
            </p>
          </div>
        )}

        {stage === "paid" && (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <p className="font-display text-lg">Pagamento confirmado!</p>
            <p className="text-sm text-muted-foreground">Liberando seu acesso…</p>
          </div>
        )}

        {stage === "expired" && (
          <div className="py-6 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-amber-500" />
            <p className="text-sm">
              O tempo de espera expirou e ainda não recebemos seu pagamento. Você pode gerar um novo
              Pix abaixo.
            </p>
            <Button onClick={regenerate}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Gerar novo Pix
            </Button>
          </div>
        )}

        {stage === "error" && (
          <div className="py-6 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm">{error ?? "Não foi possível gerar o Pix."}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button onClick={regenerate}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Tentar de novo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
