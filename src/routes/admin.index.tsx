import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminDashboard } from "@/lib/admin.functions";
import { formatBRLFromCents } from "@/lib/admin-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const fetchDashboard = useServerFn(getAdminDashboard);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => fetchDashboard(),
  });

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Últimos 7 dias e estado atual</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Vendas (7d)"
          value={formatBRLFromCents(data.sales7dCents)}
          sub={`${data.sales7dCount} pagamento(s) aprovado(s)`}
        />
        <StatCard title="Surpresa ativa" value={String(data.activeSurpriseCount)} sub="usuários" />
        <StatCard
          title="Memory Lane ativo"
          value={String(data.activeMemoryLaneCount)}
          sub="usuários"
        />
        <StatCard
          title="Pagamentos órfãos"
          value={String(data.orphanPaymentsCount)}
          sub="sem user_id"
        />
      </div>

      {data.orphanPaymentsCount > 0 ? (
        <Button asChild variant="outline">
          <Link to="/admin/payments" search={{ orphan: true }}>
            Ver pagamentos órfãos
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

function StatCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}
