import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isAdminFromAppMetadata } from "@/lib/admin-auth";

export function useIsAdmin(): boolean {
  const { user, isAuthenticated } = useAuth();
  return useMemo(() => {
    if (!isAuthenticated || !user) return false;
    return isAdminFromAppMetadata(user.app_metadata as Record<string, unknown> | undefined);
  }, [isAuthenticated, user]);
}
