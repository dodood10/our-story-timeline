import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { getAffiliatePortalDashboard } from "@/lib/affiliate.functions";

export function useIsAffiliate() {
  const { isAuthenticated, loading: authLoading, configured } = useAuth();
  const dashboardFn = useServerFn(getAffiliatePortalDashboard);

  const query = useQuery({
    queryKey: ["affiliate", "portal"],
    queryFn: () => dashboardFn(),
    enabled: configured && isAuthenticated && !authLoading,
    retry: false,
  });

  const isAffiliate = query.isSuccess;
  const checking = authLoading || (isAuthenticated && query.isLoading);

  return {
    isAffiliate,
    checking,
    configured,
    dashboard: query.data,
    refetch: query.refetch,
  };
}
