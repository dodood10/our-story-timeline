import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/hooks/useApp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Camera, Download, RotateCcw, Upload, Cloud, RefreshCw, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCouplePhoto } from "@/hooks/useCouplePhoto";
import type { Couple, RelationshipStatus, Theme } from "@/lib/types";
import jsPDF from "jspdf";
import { formatDatePT, daysTogether } from "@/lib/dates";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { QuotaMeter } from "@/components/common/QuotaMeter";
import { downloadBackup, importBackup, type BackupBundle } from "@/lib/backup";
import { generateSyncCode, pushSync, pullSync, isSupabaseConfigured } from "@/lib/sync";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { useRef } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Memory Lane" },
      { name: "description", content: "Edite o perfil do casal e personalize o app." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { couple, hydrated, onboarded } = useApp();
  if (!hydrated) {
    return <div className="p-12 text-center text-muted-foreground">Carregando...</div>;
  }
  if (!couple) {
    return (
      <div className="p-12 max-w-md mx-auto text-center space-y-4">
        <p className="text-muted-foreground">Perfil do casal não encontrado.</p>
        {!onboarded && (
          <Button asChild>
            <Link to="/app">Completar cadastro</Link>
          </Button>
        )}
      </div>
    );
  }
  return <SettingsForm couple={couple} />;
}

function SettingsForm({ couple }: { couple: Couple }) {
  const { setCouple, settings, setTheme, setNotifications, setSyncCode: persistSyncCode, memories, resetSeed } = useApp();
  const supabaseReady = isSupabaseConfigured();
  const syncCode = settings.syncCode ?? "";
  const [name1, setName1] = useState(couple.name1);
  const [name2, setName2] = useState(couple.name2);
  const { photo, setPhoto, onPhotoChange } = useCouplePhoto(couple.photo);
  const [startDate, setStartDate] = useState(couple.startDate);
  const [status, setStatus] = useState<RelationshipStatus>(couple.status);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const [confirmPush, setConfirmPush] = useState(false);
  const [pullCode, setPullCode] = useState("");
  const [confirmPull, setConfirmPull] = useState(false);

  function save() {
    if (!name1.trim() || !name2.trim()) return toast.error("Preencha os nomes");
    setSaving(true);
    setCouple({ ...couple, name1: name1.trim(), name2: name2.trim(), photo, startDate, status });
    setTimeout(() => { setSaving(false); toast.success("Perfil atualizado 💕"); }, 200);
  }

  async function exportPdf() {
    try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    let y = margin;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(`${couple.name1} & ${couple.name2}`, margin, y);
    y += 28;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Juntos desde ${formatDatePT(couple.startDate)} — ${daysTogether(couple.startDate)} dias`, margin, y);
    y += 28;
    doc.setDrawColor(220);
    doc.line(margin, y, 595 - margin, y);
    y += 18;

    const sorted = memories.slice().sort((a, b) => +new Date(b.date) - +new Date(a.date));
    for (const m of sorted) {
      if (y > 780) { doc.addPage(); y = margin; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(m.title, margin, y);
      y += 14;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`${formatDatePT(m.date)}${m.location ? " — " + m.location : ""}`, margin, y);
      doc.setTextColor(0);
      y += 14;
      if (m.description) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(m.description, 595 - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 14 + 10;
      } else {
        y += 6;
      }
    }
    doc.save(`memory-lane-${couple.name1}-${couple.name2}.pdf`);
    toast.success("PDF gerado 💕");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao gerar o PDF");
    }
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const text = await f.text();
      const bundle = JSON.parse(text) as BackupBundle;
      await importBackup(bundle);
      toast.success("Backup restaurado. Recarregando...");
      setTimeout(() => location.reload(), 800);
    } catch (err) {
      console.error(err);
      toast.error("Arquivo inválido");
    }
  }

  async function doPush() {
    setConfirmPush(false);
    const code = syncCode.trim() || generateSyncCode();
    if (!syncCode.trim()) persistSyncCode(code);
    try {
      setSyncBusy(true);
      await pushSync(code);
      persistSyncCode(code.trim().toUpperCase());
      toast.success("Sincronizado! Guarde seu código.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSyncBusy(false);
    }
  }

  async function doPull() {
    setConfirmPull(false);
    try {
      setSyncBusy(true);
      await pullSync(pullCode.trim().toUpperCase());
      toast.success("Dados restaurados. Recarregando...");
      setTimeout(() => location.reload(), 800);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSyncBusy(false);
    }
  }

  return (
    <div className="px-4 sm:px-8 py-8 max-w-2xl mx-auto space-y-8">
      <PageHeader icon={SettingsIcon} title="Configurações" />

      <section className="space-y-4 rounded-2xl bg-card border border-border p-6 shadow-card">
        <h2 className="font-display text-xl">Perfil do casal</h2>
        <div className="flex items-center gap-4">
          <label className="relative h-20 w-20 rounded-full bg-muted overflow-hidden cursor-pointer group">
            {photo ? (
              <img src={photo} alt="Casal" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-3xl">💕</div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
          </label>
          <div className="flex-1 grid sm:grid-cols-2 gap-2">
            <Input value={name1} onChange={(e) => setName1(e.target.value)} placeholder="Nome 1" />
            <Input value={name2} onChange={(e) => setName2(e.target.value)} placeholder="Nome 2" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Início do relacionamento</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as RelationshipStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dating">Namorando</SelectItem>
                <SelectItem value="engaged">Noivos</SelectItem>
                <SelectItem value="married">Casados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button>
      </section>

      <section className="space-y-4 rounded-2xl bg-card border border-border p-6 shadow-card">
        <h2 className="font-display text-xl">Tema visual</h2>
        <RadioGroup value={settings.theme} onValueChange={(v) => setTheme(v as Theme)} className="grid sm:grid-cols-3 gap-3">
          {([
            { id: "minimal", name: "Minimalista", desc: "Branco e rosa claro" },
            { id: "romantic", name: "Romântico", desc: "Rosa e dourado" },
            { id: "modern", name: "Moderno", desc: "Roxo e azul" },
          ] as const).map((t) => (
            <label
              key={t.id}
              className={`rounded-xl border p-3 cursor-pointer transition ${
                settings.theme === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
              }`}
            >
              <RadioGroupItem value={t.id} id={t.id} className="sr-only" />
              <p className="font-medium text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </label>
          ))}
        </RadioGroup>
      </section>

      <section className="rounded-2xl bg-card border border-border p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg">Lembretes de datas</p>
            <p className="text-sm text-muted-foreground">Receba avisos sobre datas importantes (em breve)</p>
          </div>
          <Switch checked={settings.notifications} onCheckedChange={setNotifications} disabled />
        </div>
      </section>

      <section className="rounded-2xl bg-card border border-border p-6 shadow-card space-y-4">
        <h2 className="font-display text-xl">Backup &amp; restauração</h2>
        <p className="text-sm text-muted-foreground">
          Baixe um arquivo com todas as memórias, fotos, bucket list e cartas — para guardar em segurança ou levar para outro navegador.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => downloadBackup().then(() => toast.success("Backup baixado")).catch(() => toast.error("Falha ao baixar o backup"))}>
            <Download className="h-4 w-4 mr-1.5" /> Baixar backup (JSON)
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1.5" /> Restaurar de arquivo
          </Button>
          <Button variant="outline" onClick={exportPdf}>
            <Download className="h-4 w-4 mr-1.5" /> Exportar PDF
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={onImportFile} />
        </div>
      </section>

      <section className="rounded-2xl bg-card border border-border p-6 shadow-card space-y-4">
        <h2 className="font-display text-xl flex items-center gap-2"><Cloud className="h-5 w-5 text-primary" /> Sincronizar entre dispositivos</h2>
        {!supabaseReady ? (
          <p className="text-sm text-muted-foreground">
            Sync indisponível: configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.
          </p>
        ) : (
          <>
        <p className="text-sm text-muted-foreground">
          Opcional. Gere um código secreto e use-o no celular do(a) parceiro(a). Quem tem o código tem acesso. O último envio substitui o backup na nuvem.
        </p>
        <div className="flex flex-wrap gap-2">
          <Input
            value={syncCode}
            onChange={(e) => persistSyncCode(e.target.value.toUpperCase())}
            placeholder="Seu código (gerado automaticamente)"
            className="font-mono max-w-xs"
          />
          {syncCode && (
            <Button
              variant="outline"
              onClick={() => { navigator.clipboard.writeText(syncCode); toast.success("Código copiado"); }}
            >
              <Copy className="h-4 w-4 mr-1.5" /> Copiar
            </Button>
          )}
          <Button onClick={() => setConfirmPush(true)} disabled={syncBusy || !supabaseReady}>
            {syncBusy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Cloud className="h-4 w-4 mr-1.5" />}
            {syncCode ? "Enviar para nuvem" : "Gerar código e enviar"}
          </Button>
        </div>
        <div className="border-t border-border pt-4 space-y-2">
          <p className="text-sm font-medium">Receber dados de outro dispositivo</p>
          <div className="flex flex-wrap gap-2">
            <Input
              value={pullCode}
              onChange={(e) => setPullCode(e.target.value.toUpperCase())}
              placeholder="Cole o código aqui"
              className="font-mono max-w-xs"
            />
            <Button variant="outline" onClick={() => setConfirmPull(true)} disabled={!pullCode.trim() || syncBusy}>
              <RefreshCw className="h-4 w-4 mr-1.5" /> Baixar dados
            </Button>
          </div>
        </div>
          </>
        )}
      </section>

      <section className="rounded-2xl bg-card border border-border p-6 shadow-card space-y-3">
        <h2 className="font-display text-xl">Armazenamento</h2>
        <QuotaMeter />
        <p className="text-xs text-muted-foreground">
          {memories.length} memórias guardadas neste dispositivo.
        </p>
        <Button variant="outline" onClick={() => setConfirmReset(true)}>
          <RotateCcw className="h-4 w-4 mr-1.5" /> Restaurar memórias de exemplo
        </Button>
      </section>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Restaurar memórias de exemplo?"
        description="Isso vai substituir suas memórias, bucket list e cartas pelas de exemplo."
        confirmLabel="Restaurar"
        destructive
        onConfirm={() => { resetSeed(); setConfirmReset(false); toast.success("Restaurado"); }}
      />
      <ConfirmDialog
        open={confirmPush}
        onOpenChange={setConfirmPush}
        title="Enviar para a nuvem?"
        description="O backup anterior neste código será substituído pelos dados deste dispositivo."
        confirmLabel="Enviar"
        onConfirm={doPush}
      />
      <ConfirmDialog
        open={confirmPull}
        onOpenChange={setConfirmPull}
        title="Substituir dados locais?"
        description="Os dados deste dispositivo serão substituídos pelos da nuvem. Faça um backup antes se quiser garantir."
        confirmLabel="Substituir"
        destructive
        onConfirm={doPull}
      />
    </div>
  );
}
