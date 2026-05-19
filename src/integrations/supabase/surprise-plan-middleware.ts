import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { fetchEntitlementsForUser } from "@/lib/entitlements.server";
import type { SurpriseTier } from "@/lib/access-purchase";

function isServerSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_PUBLISHABLE_KEY &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE_KEY),
  );
}

function forbidden(message: string): Error {
  const err = new Error(message);
  (err as Error & { statusCode?: number }).statusCode = 403;
  return err;
}

/**
 * Valida sessão + tier Surpresa quando Supabase está no servidor.
 * Retorna `null` em dev local sem Supabase (acesso via localStorage no cliente).
 */
export async function resolveSurprisePlanAccess(): Promise<Exclude<SurpriseTier, "none"> | null> {
  if (!isServerSupabaseConfigured()) return null;

  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    throw new Error("Unauthorized");
  }

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    throw new Error("Unauthorized");
  }

  const row = await fetchEntitlementsForUser(supabase, data.claims.sub);
  const tier = row.surpriseTier;
  if (tier !== "basic" && tier !== "premium") {
    throw forbidden(
      "Acesso ao gerador não encontrado. Finalize a compra ou entre com o e-mail usado no pagamento.",
    );
  }
  return tier;
}

export function assertRequestedSurpriseTier(
  entitled: Exclude<SurpriseTier, "none">,
  requested: "basic" | "premium",
): void {
  if (entitled === "basic" && requested === "premium") {
    throw forbidden(
      "Seu plano é Básico. Faça upgrade para Premium para desbloquear todos os recursos do plano.",
    );
  }
}
