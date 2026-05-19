import { QrCode } from "lucide-react";
import type { PaymentMethod } from "@/lib/checkout-products";

// SyncPay neste projeto suporta apenas Pix; mantemos o componente para preservar
// a API existente, mas exibimos só a opção Pix.
export function PaymentMethodTabs({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Forma de pagamento">
      <button
        type="button"
        role="radio"
        aria-checked={value === "pix"}
        onClick={() => onChange("pix")}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary bg-primary/10 p-3 text-sm font-medium"
      >
        <QrCode className="h-5 w-5" />
        Pix — aprovação instantânea
      </button>
    </div>
  );
}
