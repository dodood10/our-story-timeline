import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAccess } from "@/hooks/useAccess";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Copy,
  Download,
  Heart,
  Loader2,
  Lock,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Clock,
  MessageCircleHeart,
  UtensilsCrossed,
  Zap,
  ListChecks,
} from "lucide-react";
import { generateSurprisePlan } from "@/lib/surprise.functions";
import {
  SurpriseAnswersSchema,
  type SurpriseAnswers,
  type SurprisePlan,
} from "@/lib/surprise-types";
import {
  ANSWERS_KEY,
  readCachedPlan,
  writeCachedPlan,
  clearPlanCache,
} from "@/lib/surprise-cache";
import { AccessGateDenied, AccessGateLoading } from "@/components/surprise/AccessGate";

export const Route = createFileRoute("/surprise/plan")({
  head: () => ({ meta: [{ title: "Seu plano romântico" }] }),
  component: PlanPage,
});

function PlanPage() {
  const { hasSurprise, isPremium, hydrated } = useAccess();
  const navigate = useNavigate();
  const generate = useServerFn(generateSurprisePlan);
  const tier = isPremium ? "premium" : "basic";
  const [plan, setPlan] = useState<SurprisePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const loadKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!hasSurprise) {
      navigate({ to: "/surprise" });
      return;
    }
    if (loadKeyRef.current === tier) return;
    loadKeyRef.current = tier;

    const cached = readCachedPlan(tier);
    if (cached) {
      setPlan(cached);
      setLoading(false);
      return;
    }
    void doGenerate();
  }, [hydrated, hasSurprise, tier, navigate]);

  async function doGenerate() {
    setError(null);
    setLoading(true);
    try {
      const rawAnswers = localStorage.getItem(ANSWERS_KEY);
      if (!rawAnswers) {
        navigate({ to: "/surprise/quiz" });
        return;
      }
      const partial = JSON.parse(rawAnswers);
      const data = SurpriseAnswersSchema.parse({
        ...partial,
        tier,
      } satisfies SurpriseAnswers);
      const result = await generate({ data });
      setPlan(result);
      writeCachedPlan(tier, result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar o plano.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function regenerate() {
    clearPlanCache();
    setPlan(null);
    loadKeyRef.current = null;
    void doGenerate();
  }

  if (!hydrated) return <AccessGateLoading />;
  if (!hasSurprise) return <AccessGateDenied />;

  async function copyAll() {
    if (!plan) return;
    const text = planToText(plan);
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Plano copiado!");
    } catch {
      toast.error("Não foi possível copiar. Selecione o texto e copie manualmente.");
    }
  }

  async function downloadPdf() {
    if (!plan || !printRef.current) return;
    const [{ default: jsPDF }, html2canvas] = await Promise.all([
      import("jspdf"),
      import("html2canvas").then((m) => m.default),
    ]);
    toast.loading("Gerando PDF...", { id: "pdf" });
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const img = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(img, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(img, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save("surpresa-romantica.pdf");
      toast.success("PDF baixado!", { id: "pdf" });
    } catch (e) {
      console.error(e);
      toast.error("Falha ao gerar PDF", { id: "pdf" });
    }
  }

  if (loading && !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
          <p className="font-display text-2xl mt-4">Montando seu plano...</p>
          <p className="text-muted-foreground mt-2 text-sm">Isso leva uns 10 segundos. ✨</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-card border border-border rounded-3xl p-8 shadow-card">
          <p className="font-display text-2xl">Algo deu errado</p>
          <p className="text-muted-foreground mt-2">{error ?? "Tente gerar novamente."}</p>
          <div className="mt-6 flex gap-2 justify-center">
            <Button onClick={doGenerate}><RotateCcw className="h-4 w-4 mr-1.5" /> Tentar novamente</Button>
            <Button asChild variant="ghost"><Link to="/surprise/quiz">Voltar ao quiz</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft pb-16">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-2 mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/surprise/quiz"><ArrowLeft className="h-4 w-4 mr-1" /> Refazer quiz</Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyAll}>
              <Copy className="h-4 w-4 mr-1.5" /> Copiar
            </Button>
            {isPremium ? (
              <Button size="sm" onClick={downloadPdf}>
                <Download className="h-4 w-4 mr-1.5" /> PDF
              </Button>
            ) : (
              <Button size="sm" variant="secondary" disabled>
                <Lock className="h-4 w-4 mr-1.5" /> PDF (Premium)
              </Button>
            )}
          </div>
        </div>

        <div ref={printRef} className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-card space-y-8">
          <header className="text-center">
            <Heart className="h-8 w-8 text-primary mx-auto fill-primary/20" />
            <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Sparkles className="h-3 w-3" /> Plano {isPremium ? "Premium" : "Básico"}
            </span>
            <h1 className="font-display text-3xl sm:text-5xl mt-3 leading-tight">{plan.title}</h1>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{plan.concept}</p>
          </header>

          <Section icon={Sparkles} title="Decoração recomendada">
            <h4 className="font-medium mt-2">Montagem</h4>
            <ul className="mt-1 space-y-1.5 text-sm">
              {plan.decoration.setup.map((s, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary">•</span><span>{s}</span></li>
              ))}
            </ul>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <InfoBox label="Iluminação" text={plan.decoration.lighting} />
              <InfoBox label="Fotos" text={plan.decoration.photos} />
            </div>
            {plan.decoration.avoid.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-destructive">⚠️ Evite:</p>
                <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                  {plan.decoration.avoid.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            )}
          </Section>

          <Section icon={ShoppingBag} title="Lista de compras">
            <div className="grid sm:grid-cols-2 gap-5 mt-2">
              <ChecklistList title="Essencial" items={plan.shopping.essential} storageKey="ml.surprise.essential" highlight />
              <ChecklistList title="Opcional" items={plan.shopping.optional} storageKey="ml.surprise.optional" />
            </div>
          </Section>

          <Section icon={Clock} title="Passo a passo">
            <ol className="mt-2 space-y-3">
              {plan.timeline.map((t, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 items-start"
                >
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium min-w-[80px] text-center">
                    {t.time}
                  </span>
                  <span className="text-sm pt-0.5">{t.task}</span>
                </motion.li>
              ))}
            </ol>
          </Section>

          <Section icon={Heart} title="Roteiro da noite">
            <ol className="mt-2 space-y-2 text-sm list-decimal list-inside">
              {plan.nightScript.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </Section>

          {/* Premium sections */}
          <PremiumSection isPremium={isPremium} icon={MessageCircleHeart} title="Frases românticas prontas">
            <div className="mt-2 grid sm:grid-cols-2 gap-2">
              {plan.romanticPhrases.map((p, i) => (
                <div key={i} className="rounded-xl bg-secondary/50 border border-border p-3 text-sm italic">"{p}"</div>
              ))}
            </div>
          </PremiumSection>

          <PremiumSection isPremium={isPremium} icon={UtensilsCrossed} title="Ideias de jantar">
            <ul className="mt-2 space-y-1.5 text-sm">
              {plan.dinnerIdeas.map((d, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span>{d}</li>)}
            </ul>
          </PremiumSection>

          <PremiumSection isPremium={isPremium} icon={Zap} title="Plano emergência (1 hora)">
            <ol className="mt-2 space-y-2 text-sm list-decimal list-inside">
              {plan.emergencyPlan.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </PremiumSection>

          <PremiumSection isPremium={isPremium} icon={ListChecks} title="Checklist completo">
            <ChecklistList title="" items={plan.checklist} storageKey="ml.surprise.checklist" />
          </PremiumSection>
        </div>

        {!isPremium && (
          <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 text-center">
            <p className="font-display text-xl">Desbloqueie tudo no Premium</p>
            <p className="text-sm text-muted-foreground mt-1">Frases, ideias de jantar, plano emergência, checklist e PDF.</p>
            <Button asChild className="mt-4">
              <Link to="/surprise" search={{ plan: "premium" }}>
                Upgrade por R$19,90
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" /> {title}
      </h2>
      {children}
    </section>
  );
}

function PremiumSection({
  isPremium,
  icon: Icon,
  title,
  children,
}: {
  isPremium: boolean;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative">
      <h2 className="font-display text-2xl flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" /> {title}
        {!isPremium && <Lock className="h-4 w-4 text-muted-foreground" />}
      </h2>
      <div className={!isPremium ? "blur-sm select-none pointer-events-none" : ""}>{children}</div>
      {!isPremium && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-2">
          <Link
            to="/surprise"
            search={{ plan: "premium" }}
            className="text-sm font-medium text-primary hover:underline"
          >
            Disponível no Premium →
          </Link>
        </div>
      )}
    </section>
  );
}

function InfoBox({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 border border-border p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm mt-1">{text}</p>
    </div>
  );
}

function ChecklistList({
  title,
  items,
  storageKey,
  highlight,
}: {
  title: string;
  items: string[];
  storageKey: string;
  highlight?: boolean;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [listHydrated, setListHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw));
    } catch { /* */ }
    setListHydrated(true);
  }, [storageKey]);
  function toggle(k: string) {
    if (!listHydrated) return;
    setChecked((c) => {
      const next = { ...c, [k]: !c[k] };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }
  return (
    <div>
      {title && <p className={`text-sm font-medium mb-2 ${highlight ? "text-primary" : "text-muted-foreground"}`}>{title}</p>}
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i}>
            <label className="flex gap-2 text-sm items-start cursor-pointer">
              <input
                type="checkbox"
                checked={listHydrated ? !!checked[it] : false}
                onChange={() => toggle(it)}
                className="mt-1 accent-primary"
              />
              <span className={checked[it] ? "line-through text-muted-foreground" : ""}>{it}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function planToText(p: SurprisePlan): string {
  const L: string[] = [];
  L.push(`${p.title}`, "", p.concept, "");
  L.push("== DECORAÇÃO ==");
  p.decoration.setup.forEach((s) => L.push(`• ${s}`));
  L.push(`Iluminação: ${p.decoration.lighting}`);
  L.push(`Fotos: ${p.decoration.photos}`);
  if (p.decoration.avoid.length) L.push(`Evite: ${p.decoration.avoid.join(", ")}`);
  L.push("", "== LISTA DE COMPRAS ==", "Essencial:");
  p.shopping.essential.forEach((s) => L.push(`• ${s}`));
  L.push("Opcional:");
  p.shopping.optional.forEach((s) => L.push(`• ${s}`));
  L.push("", "== PASSO A PASSO ==");
  p.timeline.forEach((t) => L.push(`${t.time} — ${t.task}`));
  L.push("", "== ROTEIRO DA NOITE ==");
  p.nightScript.forEach((s, i) => L.push(`${i + 1}. ${s}`));
  if (p.romanticPhrases.length) {
    L.push("", "== FRASES ==");
    p.romanticPhrases.forEach((s) => L.push(`"${s}"`));
  }
  if (p.dinnerIdeas.length) {
    L.push("", "== JANTAR ==");
    p.dinnerIdeas.forEach((s) => L.push(`• ${s}`));
  }
  if (p.emergencyPlan.length) {
    L.push("", "== EMERGÊNCIA 1H ==");
    p.emergencyPlan.forEach((s, i) => L.push(`${i + 1}. ${s}`));
  }
  if (p.checklist.length) {
    L.push("", "== CHECKLIST ==");
    p.checklist.forEach((s) => L.push(`☐ ${s}`));
  }
  return L.join("\n");
}
