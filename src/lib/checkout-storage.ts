import type { CheckoutProductId, OrderBumpId } from "./checkout-products";

const KEY_LEAD = "ml.checkout.lead";
const KEY_BUMPS = "ml.checkout.bumps";
const KEY_UPSELL = "ml.checkout.upsellKit";
const KEY_PRODUCT = "ml.checkout.lastProductId";

export interface CheckoutLead {
  fullName: string;
  email: string;
  whatsapp: string;
  cpf?: string;
}

export interface CheckoutBumps {
  cards: boolean;
  phrases: boolean;
}

const DEFAULT_BUMPS: CheckoutBumps = { cards: false, phrases: false };

export function readCheckoutLead(): CheckoutLead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_LEAD);
    return raw ? (JSON.parse(raw) as CheckoutLead) : null;
  } catch {
    return null;
  }
}

export function writeCheckoutLead(lead: CheckoutLead): void {
  localStorage.setItem(KEY_LEAD, JSON.stringify(lead));
}

export function readCheckoutBumps(): CheckoutBumps {
  if (typeof window === "undefined") return { ...DEFAULT_BUMPS };
  try {
    const raw = localStorage.getItem(KEY_BUMPS);
    return raw ? { ...DEFAULT_BUMPS, ...(JSON.parse(raw) as CheckoutBumps) } : { ...DEFAULT_BUMPS };
  } catch {
    return { ...DEFAULT_BUMPS };
  }
}

export function writeCheckoutBumps(bumps: CheckoutBumps): void {
  localStorage.setItem(KEY_BUMPS, JSON.stringify(bumps));
}

export function setBump(id: OrderBumpId, value: boolean): void {
  writeCheckoutBumps({ ...readCheckoutBumps(), [id]: value });
}

export function readUpsellKit(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY_UPSELL) === "true";
}

export function writeUpsellKit(value: boolean): void {
  localStorage.setItem(KEY_UPSELL, value ? "true" : "false");
}

export function readLastProductId(): CheckoutProductId {
  if (typeof window === "undefined") return "premium";
  const v = localStorage.getItem(KEY_PRODUCT);
  return v === "basic" ? "basic" : "premium";
}

export function writeLastProductId(id: CheckoutProductId): void {
  localStorage.setItem(KEY_PRODUCT, id);
}

export function persistCheckoutDraft(
  lead: CheckoutLead,
  bumps: CheckoutBumps,
  productId: CheckoutProductId,
): void {
  writeCheckoutLead(lead);
  writeCheckoutBumps(bumps);
  writeLastProductId(productId);
}

/** Simulated checkout — replace with gateway webhook later. */
export function submitCheckoutMock(): void {
  // TODO: POST /api/checkout → Mercado Pago Pix/Card → webhook libera tier
}
