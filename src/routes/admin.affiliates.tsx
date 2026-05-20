import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import {
  adminApproveEligibleConversions,
  adminCreateAffiliateFn,
  adminGetAffiliates,
} from "@/lib/affiliate.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/affiliates")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AdminAffiliatesPage,
});

function AdminAffiliatesPage() {
  const listFn = useServerFn(adminGetAffiliates);
  const createFn = useServerFn(adminCreateAffiliateFn);
  const approveFn = useServerFn(adminApproveEligibleConversions);
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "affiliates"],
    queryFn: () => listFn(),
  });

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rate, setRate] = useState("0.30");
  const [status, setStatus] = useState<"pending" | "active" | "paused">("pending");
  const [creating, setCreating] = useState(false);
  const [approving, setApproving] = useState(false);

  async function onCreate() {
    setCreating(true);
    try {
      await createFn({
        data: {
          code: code.trim(),
          name: name.trim(),
          email: email.trim(),
          commissionRate: Number(rate),
          status,
        },
      });
      toast.success("Afiliado criado");
      setOpen(false);
      setCode("");
      setName("");
      setEmail("");
      await queryClient.invalidateQueries({ queryKey: ["admin", "affiliates"] });
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao criar");
    } finally {
      setCreating(false);
    }
  }

  async function onApproveEligible() {
    setApproving(true);
    try {
      const result = await approveFn();
      toast.success(`${result.count} conversão(ões) aprovada(s)`);
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao aprovar");
    } finally {
      setApproving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl">Afiliados</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Programa last-touch · comissão manual
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={approving} onClick={() => void onApproveEligible()}>
            {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aprovar pendentes &gt; 7d"}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Novo afiliado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar afiliado</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label>Código (4–20, A-Z0-9)</Label>
                  <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
                </div>
                <div className="space-y-1">
                  <Label>Nome</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>E-mail</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
                <Button className="w-full" disabled={creating} onClick={() => void onCreate()}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-x-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>%</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vinculado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-mono">{a.code}</TableCell>
                <TableCell>{a.name}</TableCell>
                <TableCell className="text-sm">{a.email}</TableCell>
                <TableCell>{Math.round(a.commission_rate * 100)}%</TableCell>
                <TableCell>
                  <Badge variant={a.status === "active" ? "default" : "secondary"}>
                    {a.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {a.user_id ? "Sim" : "Não"}
                </TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/admin/affiliates/$id" params={{ id: a.id }}>
                      Detalhe
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
