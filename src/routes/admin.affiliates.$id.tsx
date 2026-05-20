import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  adminGetAffiliateConversions,
  adminGetAffiliates,
  adminLinkAffiliateUser,
  adminMarkConversionsPaid,
  adminPatchAffiliate,
} from "@/lib/affiliate.functions";
import { formatBRLFromCents } from "@/lib/admin-format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/affiliates/$id")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AdminAffiliateDetailPage,
});

function AdminAffiliateDetailPage() {
  const { id } = Route.useParams();
  const listFn = useServerFn(adminGetAffiliates);
  const conversionsFn = useServerFn(adminGetAffiliateConversions);
  const patchFn = useServerFn(adminPatchAffiliate);
  const linkFn = useServerFn(adminLinkAffiliateUser);
  const markPaidFn = useServerFn(adminMarkConversionsPaid);
  const queryClient = useQueryClient();

  const { data: affiliates, isLoading } = useQuery({
    queryKey: ["admin", "affiliates"],
    queryFn: () => listFn(),
  });

  const affiliate = affiliates?.find((a) => a.id === id);

  const { data: conversions, refetch: refetchConv } = useQuery({
    queryKey: ["admin", "affiliate-conversions", id],
    queryFn: () => conversionsFn({ data: { affiliateId: id } }),
    enabled: Boolean(id),
  });

  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [status, setStatus] = useState<"pending" | "active" | "paused">("pending");
  const [userId, setUserId] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [linking, setLinking] = useState(false);
  const [marking, setMarking] = useState(false);
  useEffect(() => {
    if (!affiliate) return;
    setName(affiliate.name);
    setRate(String(affiliate.commission_rate));
    setStatus(affiliate.status);
    setUserId(affiliate.user_id ?? "");
  }, [affiliate]);

  async function onSave() {
    if (!affiliate) return;
    setSaving(true);
    try {
      await patchFn({
        data: {
          id: affiliate.id,
          name: name.trim() || undefined,
          commissionRate: rate ? Number(rate) : undefined,
          status,
          userId: userId.trim() ? userId.trim() : null,
        },
      });
      toast.success("Afiliado atualizado");
      await queryClient.invalidateQueries({ queryKey: ["admin", "affiliates"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function onLinkByEmail() {
    if (!affiliate) return;
    setLinking(true);
    try {
      await linkFn({ data: { affiliateId: affiliate.id } });
      toast.success("Conta vinculada pelo e-mail");
      await queryClient.invalidateQueries({ queryKey: ["admin", "affiliates"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao vincular");
    } finally {
      setLinking(false);
    }
  }

  async function onMarkPaid() {
    const ids = [...selected];
    if (!ids.length) return;
    setMarking(true);
    try {
      const result = await markPaidFn({ data: { ids } });
      toast.success(`${result.count} marcada(s) como paga(s)`);
      setSelected(new Set());
      await refetchConv();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setMarking(false);
    }
  }

  function toggle(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <p className="text-sm text-muted-foreground">
        Afiliado não encontrado.{" "}
        <Link to="/admin/affiliates" className="underline">
          Voltar
        </Link>
      </p>
    );
  }

  const rows = conversions ?? [];

  return (
    <div className="space-y-8">
      <div>
        <Link to="/admin/affiliates" className="text-sm text-muted-foreground hover:underline">
          ← Afiliados
        </Link>
        <h1 className="font-display text-2xl mt-2">{affiliate.code}</h1>
        <p className="text-sm text-muted-foreground">{affiliate.email}</p>
      </div>

      <div className="grid gap-4 max-w-lg">
        <div className="space-y-1">
          <Label>Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Comissão (0–1)</Label>
          <Input value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>user_id (opcional)</Label>
          <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="uuid" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={saving} onClick={() => void onSave()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
          </Button>
          <Button variant="outline" disabled={linking} onClick={() => void onLinkByEmail()}>
            Vincular por e-mail
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg">Conversões</h2>
          <Button
            size="sm"
            disabled={marking || selected.size === 0}
            onClick={() => void onMarkPaid()}
          >
            Marcar selecionadas como pagas
          </Button>
        </div>
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Pagamento</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    {c.status === "approved" ? (
                      <Checkbox
                        checked={selected.has(c.id)}
                        onCheckedChange={(v) => toggle(c.id, v === true)}
                      />
                    ) : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{c.paymentId}</TableCell>
                  <TableCell className="text-sm">{c.productKey}</TableCell>
                  <TableCell>{formatBRLFromCents(c.commissionCents)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
