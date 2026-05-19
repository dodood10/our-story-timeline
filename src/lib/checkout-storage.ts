import type { CheckoutProductId, CheckoutProductKey, OrderBumpId } from "./checkout-products";

const KEY_LEAD = "ml.checkout.lead";
const KEY_BUMPS = "ml.checkout.bumps";
const KEY_UPSELL = "ml.checkout.upsellKit";
const KEY_PRODUCT = "ml.checkout.lastProductId";
const KEY_PENDING = "ml.checkout.pendingMp";

export interface PendingMpPayment {
  externalReference: string;
  productKey: CheckoutProductKey;
  createdAt: number;
}

export function readPendingMpPayment(productKey: CheckoutProductKey): PendingMpPayment | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_PENDING);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingMpPayment;
    if (parsed.productKey !== productKey) return null;
    // Descarta entradas com mais de 24h.
    if (Date.now() - parsed.createdAt > 24 * 60 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePendingMpPayment(p: Omit<PendingMpPayment, "createdAt">): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    KEY_PENDING,
    JSON.stringify({ ...p, createdAt: Date.now() } satisfies PendingMpPayment),
  );
}

export function clearPendingMpPayment(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_PENDING);
}

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
    if (!raw) return { ...DEFAULT_BUMPS };
    const parsed = JSON.parse(raw) as Partial<CheckoutBumps>;
    return {
      cards: parsed.cards === true,
      phrases: parsed.phrases === true,
    };
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
