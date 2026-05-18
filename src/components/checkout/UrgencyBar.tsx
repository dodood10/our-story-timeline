import { formatBRL, type CheckoutProduct } from "@/lib/checkout-products";

export function UrgencyBar({ product }: { product: CheckoutProduct }) {
  return (
    <div
      role="banner"
      className="sticky top-0 z-50 bg-primary text-primary-foreground text-center py-2.5 px-4 text-sm font-medium shadow-sm"
    >
      Oferta de lançamento para o Dia dos Namorados — acesso imediato por{" "}
      <span className="font-semibold">{formatBRL(product.priceCents)}</span>
    </div>
  );
}
