import { QrCode, CreditCard } from "lucide-react";
import type { PaymentMethod } from "@/lib/checkout-products";

export function PaymentMethodTabs({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
}) {
  const base =
    "flex-1 flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-colors";
  const active = "border-primary bg-primary/10";
  const inactive = "border-border bg-background hover:bg-muted/40";
  return (
    <div role="radiogroup" aria-label="Forma de pagamento" className="flex gap-2">
      <button
        type="button"
        role="radio"
        aria-checked={value === "pix"}
        onClick={() => onChange("pix")}
        className={`${base} ${value === "pix" ? active : inactive}`}
      >
        <QrCode className="h-5 w-5" />
        Pix
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "card"}
        onClick={() => onChange("card")}
        className={`${base} ${value === "card" ? active : inactive}`}
      >
        <CreditCard className="h-5 w-5" />
        Cartão
      </button>
    </div>
  );
}
