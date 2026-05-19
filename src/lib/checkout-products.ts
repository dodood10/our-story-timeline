import type { SurpriseTier } from "@/lib/access-purchase";
import { SUBSCRIPTION_PERIOD_DAYS, SUBSCRIPTION_PRICE_CENTS } from "@/lib/memory-lane-subscription";

export type CheckoutProductId = "premium" | "basic";
export type MemoryLaneProductId = "memory_lane";
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
  tier: Exclude<SurpriseTier, "none">;
}

export interface OrderBump {
  id: OrderBumpId;
  title: string;
  description: string;
  ctaLabel: string;
  priceCents: number;
  compareAtCents: number;
  /** Destaque visual no checkout (ex.: add-on Memory Lane) */
  highlighted?: boolean;
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

export interface MemoryLaneProduct {
  id: MemoryLaneProductId;
  title: string;
  subtitle: string;
  /** Valor da mensalidade em centavos. */
  priceCents: number;
  /** Valor "cheio" para ancoragem (riscado). */
  compareAtCents: number;
  /** Duração do período em dias (informativo). */
  periodDays: number;
  features: string[];
  /** Texto curto exibido junto do preço (ex.: "/mês"). */
  priceSuffix: string;
  /** Texto explicativo abaixo do preço (renovação automática etc.). */
  billingNote: string;
}

export const MEMORY_LANE_PRODUCT: MemoryLaneProduct = {
  id: "memory_lane",
  title: "Memory Lane — assinatura mensal",
  subtitle:
    "O diário digital do casal. Linha do tempo, fotos, cartas, mapa e mais — por uma mensalidade simples.",
  priceCents: SUBSCRIPTION_PRICE_CENTS,
  compareAtCents: 3990,
  periodDays: SUBSCRIPTION_PERIOD_DAYS,
  priceSuffix: "/mês",
  billingNote:
    "Acesso por 30 dias após o pagamento. Para continuar depois, reative com um novo pagamento.",
  features: [
    "Linha do tempo de memórias",
    "Galeria e fotos no dispositivo",
    "Cartas e marcos do relacionamento",
    "Mapa dos lugares especiais",
    "Sincronização entre dispositivos (opcional)",
    "Cancele direto nas configurações",
  ],
};

export function getMemoryLaneProduct(): MemoryLaneProduct {
  return MEMORY_LANE_PRODUCT;
}

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
  headline:
    "Já que você vai montar a surpresa, desbloqueie o pacote completo para deixar sua noite ainda mais especial.",
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

/**
 * Chave canônica para o servidor calcular o preço autoritativo.
 * NUNCA confie em valores enviados pelo cliente — passe somente esta chave + bumps.
 */
export type CheckoutProductKey = "surprise:premium" | "surprise:basic" | "memory_lane";

export interface CheckoutBumpsInput {
  cards?: boolean;
  phrases?: boolean;
}

/**
 * Calcula o valor cobrado em centavos a partir de identificadores estáveis.
 * Roda em qualquer ambiente (client p/ exibir, server p/ cobrar de fato).
 */
export function resolveCheckoutAmountCents(
  productKey: CheckoutProductKey,
  bumps: CheckoutBumpsInput = {},
): { amountCents: number; label: string } {
  if (productKey === "memory_lane") {
    return { amountCents: MEMORY_LANE_PRODUCT.priceCents, label: MEMORY_LANE_PRODUCT.title };
  }
  const id: CheckoutProductId = productKey === "surprise:basic" ? "basic" : "premium";
  const product = PRODUCTS[id];
  let total = product.priceCents;
  for (const bump of ORDER_BUMPS) {
    if (bumps[bump.id]) total += bump.priceCents;
  }
  return { amountCents: total, label: product.title };
}
