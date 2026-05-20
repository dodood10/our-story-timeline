import { isValidAffiliateCodeFormat, normalizeAffiliateCode } from "@/lib/affiliate-reference";

const AFFILIATE_REF_KEY = "ml.affiliate.ref";
const AFFILIATE_EXPIRES_KEY = "ml.affiliate.expires";
export const AFFILIATE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type StoredAffiliateRef = {
  code: string;
  expiresAt: number;
};

export function captureAffiliateFromSearch(ref: string | undefined | null): string | null {
  if (!ref) return null;
  const code = normalizeAffiliateCode(ref);
  if (!isValidAffiliateCodeFormat(code)) return null;
  return code;
}

/** Last-touch: sempre grava ref válida da URL. */
export function writeAffiliateRef(code: string): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeAffiliateCode(code);
  if (!isValidAffiliateCodeFormat(normalized)) return;
  localStorage.setItem(
    AFFILIATE_REF_KEY,
    JSON.stringify({
      code: normalized,
      expiresAt: Date.now() + AFFILIATE_TTL_MS,
    } satisfies StoredAffiliateRef),
  );
}

export function readAffiliateRef(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AFFILIATE_REF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAffiliateRef;
    if (!parsed.code || Date.now() > parsed.expiresAt) {
      clearAffiliateRef();
      return null;
    }
    return parsed.code;
  } catch {
    return null;
  }
}

export function clearAffiliateRef(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AFFILIATE_REF_KEY);
  localStorage.removeItem(AFFILIATE_EXPIRES_KEY);
}
