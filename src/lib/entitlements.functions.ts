import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { deriveProductMode, hasActiveMemoryLane, type SurpriseTier } from "@/lib/access-purchase";
import { deriveSubscriptionUiState } from "@/lib/memory-lane-subscription";
import {
  fetchEntitlementsForUser,
  linkPendingPaymentsByEmail,
  migrateLocalSubscriptionAdmin,
  tickEntitlementsRow,
  upsertEntitlementsAdmin,
  type EntitlementsPayload,
} from "@/lib/entitlements.server";

export type { EntitlementsPayload };

function toPayload(row: ReturnType<typeof tickEntitlementsRow>): EntitlementsPayload {
  const subscriptionState = deriveSubscriptionUiState(row.subscription);
  const hasSurprise = row.surpriseTier === "basic" || row.surpriseTier === "premium";
  const canUseMemoryLane = hasActiveMemoryLane(row.subscription);
  return {
    ...row,
    subscriptionState,
    productMode: deriveProductMode(row.surpriseTier, row.subscription),
    hasSurprise,
    canUseMemoryLane,
    canUseSurprise: hasSurprise,
    hasAnyProduct: hasSurprise || canUseMemoryLane || subscriptionState === "lapsed",
  };
}

export const getEntitlements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EntitlementsPayload> => {
    const row = await fetchEntitlementsForUser(context.supabase, context.userId);
    const ticked = tickEntitlementsRow(row);
    if (
      ticked.subscription?.currentPeriodEnd !== row.subscription?.currentPeriodEnd ||
      (row.subscription && !ticked.subscription)
    ) {
      await upsertEntitlementsAdmin(context.userId, ticked);
    }
    return toPayload(ticked);
  });

const MigrateInput = z.object({
  subscription: z
    .object({
      status: z.enum(["active", "canceled", "past_due"]),
      startedAt: z.string(),
      currentPeriodEnd: z.string(),
      autoRenew: z.boolean(),
      renewals: z.number(),
    })
    .nullable(),
});

export const migrateLocalEntitlements = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => MigrateInput.parse(i))
  .handler(async ({ context, data }): Promise<EntitlementsPayload> => {
    const row = await migrateLocalSubscriptionAdmin(context.userId, data.subscription);
    return toPayload(tickEntitlementsRow(row));
  });

export const syncEntitlementsAfterAuth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ email: z.string().email() }).parse(i))
  .handler(async ({ context, data }): Promise<EntitlementsPayload> => {
    await linkPendingPaymentsByEmail(context.userId, data.email);
    const row = await fetchEntitlementsForUser(context.supabase, context.userId);
    return toPayload(tickEntitlementsRow(row));
  });
