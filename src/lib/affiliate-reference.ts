/** Código de afiliado na URL e external_reference (a:CODE). */

const CODE_RE = /^[A-Z0-9_-]{4,20}$/;

export function normalizeAffiliateCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidAffiliateCodeFormat(code: string): boolean {
  return CODE_RE.test(normalizeAffiliateCode(code));
}

export function parseAffiliateCodeFromExternalReference(ref: string): string | null {
  for (const part of ref.split("|")) {
    if (part.startsWith("a:")) {
      const code = normalizeAffiliateCode(part.slice(2));
      return isValidAffiliateCodeFormat(code) ? code : null;
    }
  }
  return null;
}

export function parseUserIdFromReferenceParts(ref: string): string | null {
  for (const part of ref.split("|")) {
    if (part.startsWith("u:")) {
      const id = part.slice(2);
      if (/^[0-9a-f-]{36}$/i.test(id)) return id;
    }
  }
  return null;
}

export function buildExternalReferenceParts(input: {
  affiliateCode?: string | null;
  userId?: string | null;
  suffix: string;
}): string {
  const parts: string[] = [];
  if (input.affiliateCode && isValidAffiliateCodeFormat(input.affiliateCode)) {
    parts.push(`a:${normalizeAffiliateCode(input.affiliateCode)}`);
  }
  if (input.userId) {
    parts.push(`u:${input.userId}`);
  }
  parts.push(input.suffix);
  return parts.join("|");
}

export function calculateCommissionCents(amountCents: number, rate: number): number {
  return Math.floor(amountCents * rate);
}

export function isSelfReferral(affiliateEmail: string, payerEmail: string | null): boolean {
  if (!payerEmail) return false;
  return affiliateEmail.trim().toLowerCase() === payerEmail.trim().toLowerCase();
}
