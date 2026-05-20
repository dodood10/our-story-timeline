import { createMiddleware } from "@tanstack/react-start";
import { supabaseAdmin } from "./client.server";
import { requireSupabaseAuth } from "./auth-middleware";
import { isAdminFromAppMetadata } from "@/lib/admin-auth";

export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    if (error || !data.user) {
      throw new Response("Forbidden: user not found", { status: 403 });
    }

    const meta = data.user.app_metadata as Record<string, unknown> | undefined;
    if (!isAdminFromAppMetadata(meta)) {
      throw new Response("Forbidden: admin role required", { status: 403 });
    }

    return next({
      context: {
        ...context,
        adminUserId: context.userId,
        adminEmail: data.user.email ?? null,
      },
    });
  });
