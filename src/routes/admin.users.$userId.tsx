import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  getAdminUserDetail,
  revokeAdminUserAccess,
  setAdminUserSubscription,
  setAdminUserSurpriseTier,
  syncAdminUserPayments,
} from "@/lib/admin.functions";
import type { SurpriseTier } from "@/lib/access-purchase";
import { formatBRLFromCents } from "@/lib/admin-format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Loader2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/users/$userId")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AdminUserDetailPage,
});

function AdminUserDetailPage() {
  const { userId } = Route.useParams();
  const queryClient = useQueryClient();
  const fetchDetail = useServerFn(getAdminUserDetail);
  const setTierFn = useServerFn(setAdminUserSurpriseTier);
  const setSubFn = useServerFn(setAdminUserSubscription);
  const revokeFn = useServerFn(revokeAdminUserAccess);
  const syncFn = useServerFn(syncAdminUserPayments);
  const [busy, setBusy] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => fetchDetail({ data: { userId } }),
  });

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
    await refetch();
  }

  async function onTierChange(tier: SurpriseTier) {
    setBusy(true);
    try {
      await setTierFn({ data: { userId, tier } });
      toast.success("Tier Surpresa atualizado");
      await invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function onSubscriptionAction(action: "revoke" | "extend30") {
    setBusy(true);
    try {
      await setSubFn({ data: { userId, action } });
      toast.success(action === "revoke" ? "Memory Lane revogado" : "+30 dias aplicados");
      await invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function onRevokeAll() {
    setBusy(true);
    try {
      await revokeFn({ data: { userId } });
      toast.success("Acesso revogado");
      await invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function onSyncPayments() {
    if (!data?.email) {
      toast.error("Usuário sem e-mail no perfil");
      return;
    }
    setBusy(true);
    try {
      await syncFn({ data: { userId, email: data.email } });
      toast.success("Pagamentos sincronizados");
      await invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-destructive text-sm">Usuário não encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div>
        <h1 className="font-display text-2xl">{data.email ?? data.id}</h1>
        <p className="text-xs font-mono text-muted-foreground mt-1">{data.id}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entitlements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>Surpresa: {data.entitlements.surpriseTier}</Badge>
              <Badge variant="outline">ML: {data.subscriptionState}</Badge>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Tier Surpresa</label>
              <Select
                value={data.entitlements.surpriseTier}
                onValueChange={(v) => onTierChange(v as SurpriseTier)}
                disabled={busy}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">none</SelectItem>
                  <SelectItem value="basic">basic</SelectItem>
                  <SelectItem value="premium">premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => onSubscriptionAction("extend30")}
              >
                Estender ML 30 dias
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => onSubscriptionAction("revoke")}
              >
                Revogar ML
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={onSyncPayments}>
                Sincronizar pagamentos
              </Button>
            </div>
            <ConfirmButton
              label="Revogar tudo"
              description="Remove Surpresa e Memory Lane deste usuário."
              onConfirm={onRevokeAll}
              disabled={busy}
              destructive
            />
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">JSON subscription</summary>
              <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-40">
                {JSON.stringify(data.entitlements.subscription, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pagamentos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!data.payments.length ? (
            <p className="p-4 text-sm text-muted-foreground">Nenhum pagamento.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs">{p.productKey}</TableCell>
                    <TableCell>{formatBRLFromCents(p.amountCents)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ConfirmButton({
  label,
  description,
  onConfirm,
  disabled,
  destructive,
}: {
  label: string;
  description: string;
  onConfirm: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant={destructive ? "destructive" : "default"} disabled={disabled}>
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{label}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
