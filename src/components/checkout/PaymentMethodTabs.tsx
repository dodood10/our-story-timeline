import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/checkout-products";
import { QrCode, CreditCard } from "lucide-react";

export function PaymentMethodTabs({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Forma de pagamento">
      <button
        type="button"
        role="radio"
        aria-checked={value === "pix"}
        onClick={() => onChange("pix")}
        className={cn(
          "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm transition-all",
          value === "pix"
            ? "border-primary bg-primary/10 text-foreground font-medium"
            : "border-border bg-card text-muted-foreground hover:border-primary/40",
        )}
      >
        <QrCode className="h-5 w-5" />
        Pix — acesso mais rápido
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "card"}
        onClick={() => onChange("card")}
        className={cn(
          "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm transition-all",
          value === "card"
            ? "border-primary bg-primary/10 text-foreground font-medium"
            : "border-border bg-card text-muted-foreground hover:border-primary/40",
        )}
      >
        <CreditCard className="h-5 w-5" />
        Cartão de crédito
      </button>
    </div>
  );
}
