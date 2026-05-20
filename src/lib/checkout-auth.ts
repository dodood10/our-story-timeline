import { buildExternalReferenceParts } from "@/lib/affiliate-reference";
import { readAffiliateRef } from "@/lib/affiliate-attribution";

/** Referência Mercado Pago: afiliado (se houver), usuário e sufixo. */
export function buildCheckoutExternalReference(
  userId: string | null | undefined,
  suffix: string,
  affiliateCode?: string | null,
): string {
  const code = affiliateCode ?? (typeof window !== "undefined" ? readAffiliateRef() : null);
  return buildExternalReferenceParts({
    affiliateCode: code,
    userId: userId ?? null,
    suffix,
  });
}
