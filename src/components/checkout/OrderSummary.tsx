import { ORDER_BUMPS, formatBRL, type CheckoutProduct } from "@/lib/checkout-products";
import type { CheckoutBumps } from "@/lib/checkout-storage";

export function OrderSummary({
  product,
  bumps,
  totalCents,
  compact,
  className,
}: {
  product: CheckoutProduct;
  bumps: CheckoutBumps;
  totalCents: number;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`bg-card border border-border rounded-2xl shadow-card ${compact ? "p-4" : "p-5"} ${className ?? ""}`}
    >
      <h2 className="font-display text-lg">Resumo do pedido</h2>
      <p className="text-sm text-muted-foreground mt-1">{product.title}</p>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Produto</dt>
          <dd className="font-medium">{formatBRL(product.priceCents)}</dd>
        </div>
        {ORDER_BUMPS.map((bump) =>
          bumps[bump.id] ? (
            <div key={bump.id} className="flex justify-between gap-2">
              <dt className="text-muted-foreground truncate pr-2">{bump.title}</dt>
              <dd className="font-medium shrink-0">{formatBRL(bump.priceCents)}</dd>
            </div>
          ) : null,
        )}
        <div className="flex justify-between gap-2 pt-3 border-t border-border text-base">
          <dt className="font-semibold">Total</dt>
          <dd className="font-display text-xl text-primary">{formatBRL(totalCents)}</dd>
        </div>
      </dl>
    </div>
  );
}
