import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { requireAdmin } from "@/integrations/supabase/admin-middleware";
import { requireAffiliate } from "@/integrations/supabase/affiliate-middleware";
import { isValidAffiliateCodeFormat, normalizeAffiliateCode } from "@/lib/affiliate-reference";
import { clientKeyFromRequest, checkSurpriseRateLimit } from "@/lib/surprise-rate-limit";
import {
  adminCreateAffiliate,
  adminListAffiliates,
  adminListConversions,
  adminUpdateAffiliate,
  approvePendingConversionsOlderThan,
  COMMISSION_HOLD_DAYS,
  findAffiliateByCode,
  getAffiliatePortalStats,
  linkAffiliateByEmail,
  listConversionsForAffiliate,
  markConversionsPaid,
  recordAffiliateClick,
  updateAffiliatePixKey,
  type AffiliateStatus,
  type ConversionStatus,
} from "@/lib/affiliate.server";

export const validateAffiliateCode = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ code: z.string().min(4).max(20) }).parse(i))
  .handler(async ({ data }) => {
    const code = normalizeAffiliateCode(data.code);
    if (!isValidAffiliateCodeFormat(code)) return { valid: false as const };
    const affiliate = await findAffiliateByCode(code);
    if (!affiliate || affiliate.status !== "active") return { valid: false as const };
    return { valid: true as const, code: affiliate.code };
  });

export const recordAffiliateClickFn = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        code: z.string().min(4).max(20),
        path: z.string().max(500).optional(),
        utmSource: z.string().max(100).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    if (request) {
      try {
        checkSurpriseRateLimit(`aff-click:${clientKeyFromRequest(request)}`);
      } catch {
        return { ok: false };
      }
    }
    const affiliate = await findAffiliateByCode(data.code);
    if (!affiliate || affiliate.status !== "active") return { ok: false };
    await recordAffiliateClick(affiliate.id, { path: data.path, utmSource: data.utmSource });
    return { ok: true };
  });

export const getAffiliatePortalDashboard = createServerFn({ method: "GET" })
  .middleware([requireAffiliate])
  .handler(async ({ context }) => {
    const stats = await getAffiliatePortalStats(context.affiliateId);
    return {
      affiliate: {
        code: context.affiliate.code,
        name: context.affiliate.name,
        commissionRate: context.affiliate.commission_rate,
        pixKey: context.affiliate.pix_key,
      },
      stats,
    };
  });

export const listMyAffiliateConversions = createServerFn({ method: "GET" })
  .middleware([requireAffiliate])
  .handler(async ({ context }) => listConversionsForAffiliate(context.affiliateId));

export const updateMyAffiliatePixKey = createServerFn({ method: "POST" })
  .middleware([requireAffiliate])
  .inputValidator((i) => z.object({ pixKey: z.string().min(3).max(200) }).parse(i))
  .handler(async ({ context, data }) => {
    await updateAffiliatePixKey(context.affiliateId, data.pixKey);
    return { ok: true };
  });

// --- Admin ---

export const adminGetAffiliates = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => adminListAffiliates());

const CreateAffiliateInput = z.object({
  code: z.string().min(4).max(20),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  commissionRate: z.number().min(0.01).max(1),
  status: z.enum(["pending", "active", "paused"]).optional(),
});

export const adminCreateAffiliateFn = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i) => CreateAffiliateInput.parse(i))
  .handler(async ({ data }) =>
    adminCreateAffiliate({
      code: data.code,
      name: data.name,
      email: data.email,
      commissionRate: data.commissionRate,
      status: data.status as AffiliateStatus | undefined,
    }),
  );

export const adminPatchAffiliate = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().optional(),
        commissionRate: z.number().min(0.01).max(1).optional(),
        status: z.enum(["pending", "active", "paused"]).optional(),
        userId: z.string().uuid().nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const { id, ...patch } = data;
    await adminUpdateAffiliate(id, {
      name: patch.name,
      commissionRate: patch.commissionRate,
      status: patch.status as AffiliateStatus | undefined,
      userId: patch.userId,
    });
    return { ok: true };
  });

export const adminLinkAffiliateUser = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i) => z.object({ affiliateId: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const linked = await linkAffiliateByEmail(data.affiliateId);
    if (!linked) throw new Error("Nenhum usuário com o e-mail do afiliado");
    return { ok: true };
  });

export const adminGetAffiliateConversions = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator((i) =>
    z
      .object({
        affiliateId: z.string().uuid().optional(),
        status: z.enum(["pending", "approved", "paid", "reversed"]).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) =>
    adminListConversions({
      affiliateId: data.affiliateId,
      status: data.status as ConversionStatus | undefined,
    }),
  );

export const adminApproveEligibleConversions = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .handler(async () => {
    const count = await approvePendingConversionsOlderThan(COMMISSION_HOLD_DAYS);
    return { count };
  });

export const adminMarkConversionsPaid = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i) => z.object({ ids: z.array(z.string().uuid()).min(1) }).parse(i))
  .handler(async ({ data }) => {
    const count = await markConversionsPaid(data.ids);
    return { count };
  });
