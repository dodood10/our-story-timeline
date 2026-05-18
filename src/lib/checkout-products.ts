import type { SurpriseTier } from "@/hooks/useAccess";

export type CheckoutProductId = "premium" | "basic";
export type OrderBumpId = "cards" | "phrases";
export type PaymentMethod = "pix" | "card";

export interface CheckoutProduct {
  id: CheckoutProductId;
  title: string;
  subtitle: string;
  priceCents: number;
  compareAtCents: number;
  features: string[];
  tagline: string;
  tier: SurpriseTier;
}

export interface OrderBump {
  id: OrderBumpId;
  title: string;
  description: string;
  ctaLabel: string;
  priceCents: number;
  compareAtCents: number;
}

export const ORDER_BUMPS: OrderBump[] = [
  {
    id: "cards",
    title: "Kit Cartões Românticos para Imprimir",
    description:
      "Cartões prontos com frases românticas para espalhar pela casa, colocar no presente ou deixar na mesa.",
    ctaLabel: "Adicionar ao meu pedido",
    priceCents: 690,
    compareAtCents: 1490,
  },
  {
    id: "phrases",
    title: "100 Frases e Mensagens Românticas",
    description:
      "Frases prontas para bilhetes, WhatsApp, cartão, legenda e declaração. Perfeito para quem trava na hora de escrever.",
    ctaLabel: "Quero as frases também",
    priceCents: 490,
    compareAtCents: 990,
  },
];

export const UPSELL_KIT = {
  title: "Kit Surpresa Premium",
  priceCents: 1700,
  features: [
    "10 temas de decoração prontos",
    "Ideias de jantar romântico",
    "Playlist separada por clima",
    "Roteiro sensual/intimista",
    "Ideias de presente barato",
    "Modelos de bilhete e carta",
  ],
  headline: "Já que você vai montar a surpresa, desbloqueie o pacote completo para deixar sua noite ainda mais especial.",
} as const;

const PRODUCTS: Record<CheckoutProductId, CheckoutProduct> = {
  premium: {
    id: "premium",
    title: "Minha Noite Romântica Premium",
    subtitle: "Acesso imediato ao gerador de surpresa personalizada para o Dia dos Namorados.",
    priceCents: 1990,
    compareAtCents: 3990,
    tier: "premium",
    tagline:
      "Ideal para quem quer surpreender no Dia dos Namorados sem gastar com restaurante caro ou decoração profissional.",
    features: [
      "Gerador de surpresa personalizada",
      "Plano completo de decoração",
      "Lista de compras dentro do seu orçamento",
      "Roteiro da noite passo a passo",
      "Frases românticas prontas",
      "Ideias de jantar simples",
      "Plano emergência para montar em até 1 hora",
      "Checklist final para não esquecer nada",
      "Acesso imediato após o pagamento",
    ],
  },
  basic: {
    id: "basic",
    title: "Minha Noite Romântica",
    subtitle: "Gerador de surpresa com o essencial para montar sua noite.",
    priceCents: 1000,
    compareAtCents: 1990,
    tier: "basic",
    tagline: "Para quem quer um plano objetivo e rápido de montar em casa.",
    features: [
      "Gerador de surpresa personalizada",
      "Decoração por ambiente",
      "Lista de compras",
      "Roteiro simples da noite",
      "Acesso imediato após o pagamento",
    ],
  },
};

export function getCheckoutProduct(id: CheckoutProductId): CheckoutProduct {
  return PRODUCTS[id];
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function calcTotalCents(
  product: CheckoutProduct,
  bumps: Record<OrderBumpId, boolean>,
  upsellKit = false,
): number {
  let total = product.priceCents;
  for (const bump of ORDER_BUMPS) {
    if (bumps[bump.id]) total += bump.priceCents;
  }
  if (upsellKit) total += UPSELL_KIT.priceCents;
  return total;
}

export interface CheckoutSubmitPayload {
  productId: CheckoutProductId;
  lead: {
    fullName: string;
    email: string;
    whatsapp: string;
    cpf?: string;
  };
  bumps: Record<OrderBumpId, boolean>;
  totalCents: number;
  paymentMethod: PaymentMethod;
}
