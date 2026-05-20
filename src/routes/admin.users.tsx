import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { searchAdminUsers } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const searchFn = useServerFn(searchAdminUsers);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin", "users", debounced],
    queryFn: () => searchFn({ data: { q: debounced } }),
    enabled: debounced.length >= 3,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Usuários</h1>
        <p className="text-sm text-muted-foreground mt-1">Busque por e-mail (mín. 3 caracteres)</p>
      </div>

      <Input
        placeholder="email@exemplo.com"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />

      {debounced.length < 3 ? (
        <p className="text-sm text-muted-foreground">Digite pelo menos 3 caracteres para buscar.</p>
      ) : isLoading || isFetching ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Surpresa</TableHead>
                <TableHead>Memory Lane</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-sm">{row.email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{row.surpriseTier}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.subscriptionState}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to="/admin/users/$userId"
                      params={{ userId: row.id }}
                      className="text-sm text-primary hover:underline"
                    >
                      Detalhes
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
