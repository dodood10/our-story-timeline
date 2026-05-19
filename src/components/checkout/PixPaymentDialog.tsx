import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Copy, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createPixCharge, getPixStatus, type CreatePixResponse } from "@/lib/syncpay.functions";
import { formatBRL } from "@/lib/checkout-products";
import type { CheckoutLead } from "@/lib/checkout-storage";


type Stage = "loading" | "awaiting" | "paid" | "error";

export function PixPaymentDialog({
  open,
  onOpenChange,
  amountCents,
  productLabel,
  lead,
  externalReference,
  onPaid,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amountCents: number;
  productLabel: string;
  lead: CheckoutLead | null;
  externalReference: string;
  onPaid: () => void;
}) {
  const createFn = useServerFn(createPixCharge);
  const statusFn = useServerFn(getPixStatus);

  const [stage, setStage] = useState<Stage>("loading");
  const [error, setError] = useState<string | null>(null);
  const [charge, setCharge] = useState<CreatePixResponse | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const startedRef = useRef(false);


  // Cria a cobrança ao abrir.
  useEffect(() => {
    if (!open) {
      startedRef.current = false;
      setStage("loading");
      setError(null);
      setCharge(null);
      setQrDataUrl(null);
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;

    if (!lead) {
      setStage("error");
      setError("Preencha seus dados antes de gerar o Pix.");
      return;
    }

    const document = (lead.cpf ?? "").replace(/\D/g, "");
    if (document.length !== 11 && document.length !== 14) {
      setStage("error");
      setError("Informe um CPF válido para gerar o Pix.");
      return;
    }

    createFn({
      data: {
        amountCents,
        productLabel,
        externalReference,
        client: {
          name: lead.fullName,
          email: lead.email,
          document,
          whatsapp: lead.whatsapp,
        },
      },
    })
      .then((res) => {
        setCharge(res);
        setStage("awaiting");
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Falha ao gerar o Pix.";
        setError(msg);
        setStage("error");
      });
  }, [open, amountCents, productLabel, externalReference, lead, createFn]);

  // Gera o QR no cliente quando a SyncPay devolve só o copia-e-cola.
  useEffect(() => {
    if (!charge?.paymentCode) return;
    if (charge.paymentCodeBase64) {
      setQrDataUrl(`data:image/png;base64,${charge.paymentCodeBase64}`);
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(charge.paymentCode, {
      width: 256,
      margin: 1,
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [charge?.paymentCode, charge?.paymentCodeBase64]);


  // Polling de status enquanto aguardando.
  useEffect(() => {
    if (stage !== "awaiting" || !charge?.id) return;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 200; // ~10min com 3s

    async function tick() {
      if (cancelled) return;
      attempts += 1;
      try {
        const res = await statusFn({ data: { id: charge!.id } });
        if (cancelled) return;
        if (res.paid) {
          setStage("paid");
          onPaid();
          return;
        }
        if (res.failed) {
          setStage("error");
          setError("O pagamento foi recusado ou expirou. Tente novamente.");
          return;
        }
      } catch {
        // ignora — tenta de novo
      }
      if (attempts >= maxAttempts) return;
      setTimeout(tick, 3000);
    }
    const t = setTimeout(tick, 3000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [stage, charge?.id, statusFn, onPaid]);

  function copyCode() {
    if (!charge?.paymentCode) return;
    navigator.clipboard
      .writeText(charge.paymentCode)
      .then(() => toast.success("Código Pix copiado!"))
      .catch(() => toast.error("Não foi possível copiar."));
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
            {charge.paymentCodeBase64 && (
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${charge.paymentCodeBase64}`}
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
                  value={charge.paymentCode}
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

        {stage === "error" && (
          <div className="py-6 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm">{error ?? "Não foi possível gerar o Pix."}</p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
