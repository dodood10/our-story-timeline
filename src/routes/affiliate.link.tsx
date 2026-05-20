import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAffiliatePortalDashboard } from "@/lib/affiliate.functions";

export const Route = createFileRoute("/affiliate/link")({
  component: AffiliateLinkPage,
});

function AffiliateLinkPage() {
  const dashboardFn = useServerFn(getAffiliatePortalDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["affiliate", "portal"],
    queryFn: () => dashboardFn(),
  });
  const [copied, setCopied] = useState(false);

  const links = useMemo(() => {
    if (!data || typeof window === "undefined") return null;
    const origin = window.location.origin;
    const code = data.affiliate.code;
    return {
      landing: `${origin}/?ref=${code}`,
      short: `${origin}/r/${code}`,
      qr: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${origin}/?ref=${code}`)}`,
    };
  }, [data]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Link copiado");
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading || !data || !links) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Meu link</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compartilhe o link com <code>?ref={data.affiliate.code}</code>. Último clique vale por 30
          dias.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Link principal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input readOnly value={links.landing} className="font-mono text-sm" />
            <Button variant="outline" size="icon" onClick={() => void copy(links.landing)}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Link curto:{" "}
            <button type="button" className="underline" onClick={() => void copy(links.short)}>
              {links.short}
            </button>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <img
            src={links.qr}
            alt="QR code do link de afiliado"
            width={200}
            height={200}
            className="rounded-lg border border-border"
          />
        </CardContent>
      </Card>
    </div>
  );
}
