import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { toast } from "sonner";
import { listAdminPayments, revokeAdminPaymentAccess } from "@/lib/admin.functions";
import { formatBRLFromCents } from "@/lib/admin-format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

const searchSchema = z.object({
  orphan: z
    .union([z.boolean(), z.literal("true")])
    .optional()
    .transform((v) => v === true || v === "true"),
});

export const Route = createFileRoute("/admin/payments")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const { orphan } = Route.useSearch();
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");
  const [orphanOnly, setOrphanOnly] = useState(orphan === true);
  const listFn = useServerFn(listAdminPayments);
  const revokeFn = useServerFn(revokeAdminPaymentAccess);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "payments", status, email, orphanOnly],
    queryFn: () =>
      listFn({
        data: {
          status: status || undefined,
          email: email || undefined,
          orphanOnly,
          limit: 50,
        },
      }),
  });

  async function onRevoke(paymentId: string) {
    try {
      const result = await revokeFn({ data: { paymentId } });
      if (!result.userId) {
        toast.warning("Pagamento sem usuário vinculado — nada revogado");
      } else {
        toast.success("Acesso revogado para o produto");
      }
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Pagamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lista via service role. Revogue após reembolso no Mercado Pago.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Input
            placeholder="approved"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-36"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">E-mail</Label>
          <Input
            placeholder="filtro e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-48"
          />
        </div>
        <div className="flex items-center gap-2 pb-2">
          <Checkbox
            id="orphan"
            checked={orphanOnly}
            onCheckedChange={(v) => setOrphanOnly(v === true)}
          />
          <Label htmlFor="orphan" className="text-sm">
            Só órfãos (sem user_id)
          </Label>
        </div>
        <Button variant="secondary" onClick={() => refetch()}>
          Atualizar
        </Button>
      </div>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.rows ?? []).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs max-w-[100px] truncate">{p.id}</TableCell>
                  <TableCell className="text-xs">{p.payerEmail ?? "—"}</TableCell>
                  <TableCell className="text-xs">{p.productKey}</TableCell>
                  <TableCell>{formatBRLFromCents(p.amountCents)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{p.status}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs max-w-[80px] truncate">
                    {p.userId ?? "—"}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          Revogar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revogar acesso</AlertDialogTitle>
                          <AlertDialogDescription>
                            Revoga o acesso do produto {p.productKey} para o usuário vinculado.
                            Confirme que o reembolso foi feito no MP.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onRevoke(p.id)}>
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground p-3 border-t">
            Total: {data?.total ?? 0} (mostrando até 50)
          </p>
        </div>
      )}
    </div>
  );
}
