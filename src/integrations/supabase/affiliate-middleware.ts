import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "./auth-middleware";
import { findAffiliateByUserId, type AffiliateRow } from "@/lib/affiliate.server";

export const requireAffiliate = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const affiliate = await findAffiliateByUserId(context.userId);
    if (!affiliate) {
      throw new Response("Forbidden: active affiliate account required", { status: 403 });
    }

    return next({
      context: {
        ...context,
        affiliate,
        affiliateId: affiliate.id,
        affiliateCode: affiliate.code,
        commissionRate: affiliate.commission_rate,
      },
    });
  });

export type AffiliateContext = {
  affiliate: AffiliateRow;
  affiliateId: string;
  affiliateCode: string;
  commissionRate: number;
};
