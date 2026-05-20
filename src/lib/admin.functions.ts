import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/integrations/supabase/admin-middleware";
import { checkAdminMutationRateLimit } from "@/lib/admin-rate-limit";
import {
  getDashboardStats,
  getUserAdminDetail,
  listPaymentsAdmin,
  logAdminAction,
  searchUsersByEmail,
} from "@/lib/admin.server";
import {
  extendMemoryLaneAdmin,
  linkPendingPaymentsByEmail,
  revokeAccessForPaymentAdmin,
  revokeAllAccessAdmin,
  setSubscriptionAdmin,
  setSurpriseTierAdmin,
} from "@/lib/entitlements.server";
import type { SurpriseTier } from "@/lib/access-purchase";

function assertMutation(context: { adminUserId: string }) {
  checkAdminMutationRateLimit(context.adminUserId);
}

export const getAdminDashboard = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => getDashboardStats());

export const searchAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator((i) => z.object({ q: z.string().min(3).max(200) }).parse(i))
  .handler(async ({ data }) => searchUsersByEmail(data.q));

export const getAdminUserDetail = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator((i) => z.object({ userId: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const detail = await getUserAdminDetail(data.userId);
    if (!detail) throw new Error("Usuário não encontrado");
    return detail;
  });

const TierSchema = z.enum(["none", "basic", "premium"]);

export const setAdminUserSurpriseTier = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i) => z.object({ userId: z.string().uuid(), tier: TierSchema }).parse(i))
  .handler(async ({ context, data }) => {
    assertMutation(context);
    const row = await setSurpriseTierAdmin(data.userId, data.tier as SurpriseTier);
    await logAdminAction(context.adminUserId, "set_surprise_tier", data.userId, {
      tier: data.tier,
    });
    return row;
  });

const SubscriptionActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("revoke") }),
  z.object({ action: z.literal("extend30") }),
]);

export const setAdminUserSubscription = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i) =>
    z.object({ userId: z.string().uuid() }).and(SubscriptionActionSchema).parse(i),
  )
  .handler(async ({ context, data }) => {
    assertMutation(context);
    let row;
    if (data.action === "revoke") {
      row = await setSubscriptionAdmin(data.userId, null);
    } else {
      row = await extendMemoryLaneAdmin(data.userId, 30);
    }
    await logAdminAction(context.adminUserId, `subscription_${data.action}`, data.userId, {
      action: data.action,
    });
    return row;
  });

export const revokeAdminUserAccess = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i) => z.object({ userId: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    assertMutation(context);
    const row = await revokeAllAccessAdmin(data.userId);
    await logAdminAction(context.adminUserId, "revoke_all_access", data.userId, null);
    return row;
  });

export const syncAdminUserPayments = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i) =>
    z.object({ userId: z.string().uuid(), email: z.string().email() }).parse(i),
  )
  .handler(async ({ context, data }) => {
    assertMutation(context);
    await linkPendingPaymentsByEmail(data.userId, data.email);
    await logAdminAction(context.adminUserId, "sync_payments", data.userId, {
      email: data.email,
    });
    const detail = await getUserAdminDetail(data.userId);
    if (!detail) throw new Error("Usuário não encontrado");
    return detail;
  });

export const listAdminPayments = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator((i) =>
    z
      .object({
        status: z.string().optional(),
        email: z.string().optional(),
        orphanOnly: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => listPaymentsAdmin(data));

export const revokeAdminPaymentAccess = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i) => z.object({ paymentId: z.string().min(1) }).parse(i))
  .handler(async ({ context, data }) => {
    assertMutation(context);
    const result = await revokeAccessForPaymentAdmin(data.paymentId);
    await logAdminAction(context.adminUserId, "revoke_payment_access", result.userId, {
      paymentId: data.paymentId,
      productKey: result.productKey,
    });
    return result;
  });
