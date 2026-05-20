import { createFileRoute } from "@tanstack/react-router";
import { AffiliateShell } from "@/components/affiliate/AffiliateShell";
import { RequireAffiliate } from "@/components/affiliate/RequireAffiliate";

export const Route = createFileRoute("/affiliate")({
  head: () => ({
    meta: [{ title: "Portal de afiliados" }, { name: "robots", content: "noindex" }],
  }),
  component: AffiliateLayout,
});

function AffiliateLayout() {
  return (
    <RequireAffiliate>
      <AffiliateShell />
    </RequireAffiliate>
  );
}
