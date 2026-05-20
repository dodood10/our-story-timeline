import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBRLFromCents } from "@/lib/admin-format";
import { listMyAffiliateConversions } from "@/lib/affiliate.functions";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  paid: "Paga",
  reversed: "Estornada",
};

export const Route = createFileRoute("/affiliate/sales")({
  component: AffiliateSalesPage,
});

function AffiliateSalesPage() {
  const listFn = useServerFn(listMyAffiliateConversions);
  const { data, isLoading, error } = useQuery({
    queryKey: ["affiliate", "conversions"],
    queryFn: () => listFn(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-sm">{error.message}</p>;
  }

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Vendas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comissões ficam pendentes por 7 dias antes da aprovação.
        </p>
      </div>

      <div className="rounded-xl border border-border overflow-x-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Comissão</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma venda ainda.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-sm">
                    {new Date(row.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-sm">{row.productKey}</TableCell>
                  <TableCell className="text-sm">{formatBRLFromCents(row.amountCents)}</TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatBRLFromCents(row.commissionCents)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.status === "reversed" ? "destructive" : "secondary"}>
                      {STATUS_LABEL[row.status] ?? row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
