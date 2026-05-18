import { Checkbox } from "@/components/ui/checkbox";
import { formatBRL, type OrderBump } from "@/lib/checkout-products";

export function OrderBumpCard({
  bump,
  checked,
  onCheckedChange,
}: {
  bump: OrderBump;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  const id = `bump-${bump.id}`;
  return (
    <label
      htmlFor={id}
      className={`flex gap-3 rounded-2xl border p-4 cursor-pointer transition-all ${
        checked ? "border-primary bg-primary/5 shadow-soft" : "border-border bg-card hover:border-primary/30"
      }`}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-0.5"
        aria-labelledby={`${id}-title`}
      />
      <div className="flex-1 min-w-0">
        <p id={`${id}-title`} className="font-medium text-sm leading-snug">
          {bump.id === "cards" ? "Adicione o Kit Cartões Românticos para Imprimir" : "Adicione 100 Frases e Mensagens Românticas"}
        </p>
        <p className="text-sm mt-1">
          <span className="text-muted-foreground line-through mr-1.5">{formatBRL(bump.compareAtCents)}</span>
          <span className="font-semibold text-primary">por {formatBRL(bump.priceCents)}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-2">{bump.description}</p>
        <p className="text-xs font-medium text-primary mt-2">{bump.ctaLabel}</p>
      </div>
    </label>
  );
}
