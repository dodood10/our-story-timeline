import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRLFromCents } from "@/lib/admin-format";
import { getAffiliatePortalDashboard, updateMyAffiliatePixKey } from "@/lib/affiliate.functions";

export const Route = createFileRoute("/affiliate/")({
  component: AffiliateDashboardPage,
});

function AffiliateDashboardPage() {
  const dashboardFn = useServerFn(getAffiliatePortalDashboard);
  const pixFn = useServerFn(updateMyAffiliatePixKey);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["affiliate", "portal"],
    queryFn: () => dashboardFn(),
  });
  const [pixKey, setPixKey] = useState("");
  const [savingPix, setSavingPix] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-destructive text-sm">
        {error instanceof Error ? error.message : "Erro ao carregar dashboard."}
      </p>
    );
  }

  const { affiliate, stats } = data;
  const ratePct = Math.round(affiliate.commissionRate * 100);

  async function savePix() {
    if (!pixKey.trim()) return;
    setSavingPix(true);
    try {
      await pixFn({ data: { pixKey: pixKey.trim() } });
      toast.success("Chave Pix salva");
      await queryClient.invalidateQueries({ queryKey: ["affiliate", "portal"] });
      setPixKey("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar Pix");
    } finally {
      setSavingPix(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Olá, {affiliate.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Código <strong>{affiliate.code}</strong> · comissão {ratePct}%
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Cliques (7d)" value={String(stats.clicks7d)} />
        <StatCard title="Vendas (7d)" value={String(stats.sales7d)} />
        <StatCard
          title="Comissão pendente"
          value={formatBRLFromCents(stats.commissionPendingCents)}
          sub="aguardando 7 dias"
        />
        <StatCard
          title="Comissão aprovada"
          value={formatBRLFromCents(stats.commissionApprovedCents)}
          sub="pronta para pagamento"
        />
        <StatCard title="Comissão paga" value={formatBRLFromCents(stats.commissionPaidCents)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chave Pix para recebimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {affiliate.pixKey ? (
            <p className="text-sm text-muted-foreground">
              Cadastrada: <span className="font-mono text-foreground">{affiliate.pixKey}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma chave cadastrada.</p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 max-w-md">
            <div className="flex-1 space-y-1">
              <Label htmlFor="pix">Nova chave Pix</Label>
              <Input
                id="pix"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="e-mail, CPF ou chave aleatória"
              />
            </div>
            <Button className="sm:self-end" disabled={savingPix} onClick={() => void savePix()}>
              {savingPix ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-display">{value}</p>
        {sub ? <p className="text-xs text-muted-foreground mt-1">{sub}</p> : null}
      </CardContent>
    </Card>
  );
}
