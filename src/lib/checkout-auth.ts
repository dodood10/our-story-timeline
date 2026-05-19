import { buildExternalReference } from "@/lib/entitlements.server";

/** Referência Mercado Pago com prefixo de usuário quando logado. */
export function buildCheckoutExternalReference(
  userId: string | null | undefined,
  suffix: string,
): string {
  return buildExternalReference(userId ?? null, suffix);
}
