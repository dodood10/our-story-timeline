import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAccess } from "@/hooks/useAccess";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Copy,
  Download,
  Heart,
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
import { ANSWERS_KEY, readCachedPlan, writeCachedPlan, clearPlanCache } from "@/lib/surprise-cache";
import { readUpsellKit } from "@/lib/checkout-storage";
import { trackEvent } from "@/lib/meta-pixel";
import { AccessGateDenied, AccessGateLoading } from "@/components/surprise/AccessGate";
import { SurpriseShell } from "@/components/surprise/SurpriseShell";
import { BRAND_NAME } from "@/lib/brand";

const KIT_THEMES = [
  { name: "Cantinho do Cinema", items: "Mantas, pipoca, projetor ou TV, almofadas no chão" },
  { name: "Jardim de Velas", items: "Velas brancas espalhadas, flores no chão, pétalas de rosa" },
  { name: "Noite de Spa", items: "Toalhas felpudas, óleos aromáticos, música suave, velas" },
  { name: "Piquenique Indoor", items: "Tapete no chão, cesta, frutas, queijos e snacks favoritos" },
  { name: "Estilo Pinterest", items: "Guirlandas de luz, balões, florzinhas, letras luminosas" },
  { name: "Degustação Íntima", items: "Mesa baixa com vinho, queijos, uvas e iluminação âmbar" },
  { name: "Café da Manhã Especial", items: "Bandeja arrumada com bilhete, flor e comida favorita dela" },
  { name: "Banheiro Romântico", items: "Espuma de banho, velas, sais aromáticos, toalha morna" },
  { name: "Noite Estrelada", items: "Teto de led azul/branco, cobertor, música tranquila" },
  { name: "Jantar à Luz de Velas", items: "Toalha de mesa, 2 velas, prataria, prato especial dela" },
];

const KIT_PLAYLISTS = [
  { mood: "Romântico", tip: "Bossa nova instrumental, jazz suave, MPB lenta" },
  { mood: "Sensual", tip: "R&B lento, soul, músicas em tom de voz baixo" },
  { mood: "Fofo", tip: "Pop acústico, Ed Sheeran, Olivia Rodrigo, Maroon 5" },
  { mood: "Nostalgia", tip: "As músicas que marcaram o início do relacionamento de vocês" },
];

const KIT_GIFTS = [
  { range: "Até R$30", ideas: "Chocolate artesanal + cartão escrito à mão · Flores do mercado" },
  { range: "Até R$60", ideas: "Vinho + taças · Kit de spa básico (esfoliante + vela)" },
  { range: "Até R$100", ideas: "Perfume favorito dela · Jantar temático em casa bem montado" },
];

const KIT_CARD_TEMPLATES = [
  "Não sei fazer grandes gestos, mas sei que você merece sentir que é a pessoa mais especial do mundo. E é isso que você é pra mim.",
  "[nome dela], cada dia com você me lembra por que eu escolhi estar aqui. Hoje eu quis mostrar isso de um jeito que você não vai esquecer.",
  "Você me ensinou que amor de verdade não é perfeito — é real. E o nosso é real demais.",
];

export const Route = createFileRoute("/surprise/plan")({
  head: () => ({ meta: [{ title: `Seu plano — ${BRAND_NAME}` }] }),
  component: PlanPage,
});

const LOADING_MESSAGES = [
  { emoji: "✨", text: "Analisando suas preferências..." },
  { emoji: "🎨", text: "Escolhendo as melhores decorações..." },
  { emoji: "🛒", text: "Montando sua lista de compras..." },
  { emoji: "💌", text: "Escrevendo frases românticas..." },
  { emoji: "📋", text: "Finalizando seu roteiro da noite..." },
];

const PLAN_THEME: Record<string, string> = {
  elegante: "plan-theme-elegant",
  sensual: "plan-theme-sensual",
  pinterest: "plan-theme-pinterest",
};

function PlanPage() {
  const { hasSurprise, isPremium, hydrated } = useAccess();
  const navigate = useNavigate();
  const generate = useServerFn(generateSurprisePlan);
  const tier = isPremium ? "premium" : "basic";
  const [plan, setPlan] = useState<SurprisePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [partnerName, setPartnerName] = useState("");
  const [planStyle, setPlanStyle] = useState("");
  const [hasKit, setHasKit] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const loadKeyRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ANSWERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        setPartnerName(typeof parsed.partnerName === "string" ? parsed.partnerName : "");
        setPlanStyle(typeof parsed.style === "string" ? parsed.style : "");
      }
    } catch { /* */ }
    setHasKit(readUpsellKit());
  }, []);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(
      () => setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length),
      2000,
    );
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => {
    if (!showReveal) return;
    const t = setTimeout(() => setShowReveal(false), 3500);
    return () => clearTimeout(t);
  }, [showReveal]);

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
    setShowReveal(false);
    try {
      const rawAnswers = localStorage.getItem(ANSWERS_KEY);
      if (!rawAnswers) {
        navigate({ to: "/surprise/quiz" });
        return;
      }
      const partial = JSON.parse(rawAnswers) as Record<string, unknown>;
      const name = typeof partial.partnerName === "string" ? partial.partnerName : "";
      if (name) setPartnerName(name);
      const style = typeof partial.style === "string" ? partial.style : "";
      if (style) setPlanStyle(style);
      const data = SurpriseAnswersSchema.parse({ ...partial, tier });
      const result = await generate({ data });
      setPlan(result);
      writeCachedPlan(tier, result);
      setLoading(false);
      setShowReveal(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar o plano.";
      setError(msg);
      toast.error(msg);
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
    const msg = LOADING_MESSAGES[loadingMsgIndex];
    return (
      <SurpriseShell footer={false} mainClassName="flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-sm w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={loadingMsgIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <p className="text-5xl mb-5">{msg.emoji}</p>
              <p className="font-display text-2xl">{msg.text}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-2 justify-center mt-2">
            {LOADING_MESSAGES.map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: i <= loadingMsgIndex ? 1 : 0.25 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
          <p className="text-muted-foreground text-sm mt-6">Isso leva uns 10 segundos. ✨</p>
        </div>
      </SurpriseShell>
    );
  }

  if (showReveal && plan) {
    return (
      <SurpriseShell footer={false} mainClassName="flex items-center justify-center px-4 py-16">
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="h-16 w-16 text-primary fill-primary mx-auto" />
          </motion.div>
          <motion.p
            className="font-display text-4xl sm:text-5xl mt-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Pronto! ✨
          </motion.p>
          <motion.p
            className="text-lg mt-3 text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            {partnerName
              ? `Seu plano para ${partnerName} está criado.`
              : "Seu plano romântico está criado."}
          </motion.p>
          <motion.p
            className="text-muted-foreground mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            Agora é só executar — e ela vai adorar. ❤️
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <Button className="mt-8" onClick={() => setShowReveal(false)}>
              Ver meu plano →
            </Button>
          </motion.div>
        </motion.div>
      </SurpriseShell>
    );
  }

  if (error || !plan) {
    return (
      <SurpriseShell footer={false} mainClassName="flex items-center justify-center px-4 py-16">
        <div className="max-w-md text-center bg-card border border-border rounded-3xl p-8 shadow-card">
          <p className="font-display text-2xl">Algo deu errado</p>
          <p className="text-muted-foreground mt-2">{error ?? "Tente gerar novamente."}</p>
          <div className="mt-6 flex gap-2 justify-center">
            <Button onClick={doGenerate}>
              <RotateCcw className="h-4 w-4 mr-1.5" /> Tentar novamente
            </Button>
            <Button asChild variant="ghost">
              <Link to="/surprise/quiz">Voltar ao quiz</Link>
            </Button>
          </div>
        </div>
      </SurpriseShell>
    );
  }

  return (
    <SurpriseShell footer={false} mainClassName="max-w-3xl mx-auto px-4 py-6 sm:py-10 pb-16">
      <div className="flex items-center justify-between gap-2 mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/surprise/quiz">
            <ArrowLeft className="h-4 w-4 mr-1" /> Refazer quiz
          </Link>
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

      <div
        ref={printRef}
        className={`bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-card space-y-8 ${PLAN_THEME[planStyle] ?? ""}`}
      >
        <header className="text-center">
          <Heart className="h-8 w-8 text-primary mx-auto fill-primary/20" />
          <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Sparkles className="h-3 w-3" /> {BRAND_NAME} · Plano {isPremium ? "Premium" : "Básico"}
          </span>
          {partnerName && (
            <p className="mt-2 text-sm text-muted-foreground">
              Criado especialmente para{" "}
              <span className="font-medium text-primary">{partnerName}</span> ❤️
            </p>
          )}
          <h1 className="font-display text-3xl sm:text-5xl mt-3 leading-tight">{plan.title}</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{plan.concept}</p>
        </header>

        <Section icon={Sparkles} title="Decoração recomendada">
          <h4 className="font-medium mt-2">Montagem</h4>
          <ul className="mt-1 space-y-1.5 text-sm">
            {plan.decoration.setup.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{s}</span>
              </li>
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
                {plan.decoration.avoid.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        <Section icon={ShoppingBag} title="Lista de compras">
          <div className="grid sm:grid-cols-2 gap-5 mt-2">
            <ChecklistList
              title="Essencial"
              items={plan.shopping.essential}
              storageKey="ml.surprise.essential"
              highlight
            />
            <ChecklistList
              title="Opcional"
              items={plan.shopping.optional}
              storageKey="ml.surprise.optional"
            />
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
            {plan.nightScript.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </Section>

        {/* Premium sections */}
        <PremiumSection
          isPremium={isPremium}
          icon={MessageCircleHeart}
          title="Frases românticas prontas"
        >
          <div className="mt-2 grid sm:grid-cols-2 gap-2">
            {plan.romanticPhrases.map((p, i) => (
              <div
                key={i}
                className="rounded-xl bg-secondary/50 border border-border p-3 text-sm italic"
              >
                "{p}"
              </div>
            ))}
          </div>
        </PremiumSection>

        <PremiumSection isPremium={isPremium} icon={UtensilsCrossed} title="Ideias de jantar">
          <ul className="mt-2 space-y-1.5 text-sm">
            {plan.dinnerIdeas.map((d, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">•</span>
                {d}
              </li>
            ))}
          </ul>
        </PremiumSection>

        <PremiumSection isPremium={isPremium} icon={Zap} title="Plano emergência (1 hora)">
          <ol className="mt-2 space-y-2 text-sm list-decimal list-inside">
            {plan.emergencyPlan.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </PremiumSection>

        <PremiumSection isPremium={isPremium} icon={ListChecks} title="Checklist completo">
          <ChecklistList title="" items={plan.checklist} storageKey="ml.surprise.checklist" />
        </PremiumSection>
      </div>

      {!isPremium && (
        <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 text-center">
          <p className="font-display text-xl">Desbloqueie tudo no Premium</p>
          <p className="text-sm text-muted-foreground mt-1">
            Frases, ideias de jantar, plano emergência, checklist e PDF.
          </p>
          <Button asChild className="mt-4">
            <Link to="/surprise" search={{ plan: "premium" }}>
              Upgrade por R$19,90
            </Link>
          </Button>
        </div>
      )}

      {hasKit && <KitBonusSection />}
    </SurpriseShell>
  );
}

function KitBonusSection() {
  return (
    <div className="mt-6 rounded-3xl border-2 border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/20 p-6 sm:p-8 space-y-7">
      <header className="flex items-center gap-2">
        <span className="text-2xl">🎁</span>
        <div>
          <h2 className="font-display text-xl text-amber-900 dark:text-amber-200">Kit Surpresa Premium</h2>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Conteúdo exclusivo do seu kit adicional</p>
        </div>
      </header>

      <section>
        <h3 className="font-medium text-sm mb-3">🏠 10 Temas de Decoração Prontos</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {KIT_THEMES.map((t) => (
            <div key={t.name} className="rounded-xl bg-white/70 dark:bg-white/5 border border-amber-200/60 dark:border-amber-800/40 p-3">
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.items}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-medium text-sm mb-3">🎵 Playlists por Clima</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {KIT_PLAYLISTS.map((p) => (
            <div key={p.mood} className="rounded-xl bg-white/70 dark:bg-white/5 border border-amber-200/60 dark:border-amber-800/40 p-3">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">{p.mood}</p>
              <p className="text-sm mt-1">{p.tip}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-medium text-sm mb-3">🎀 Ideias de Presente por Orçamento</h3>
        <div className="space-y-2">
          {KIT_GIFTS.map((g) => (
            <div key={g.range} className="flex gap-3 items-start text-sm">
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 text-xs font-medium">{g.range}</span>
              <span className="text-muted-foreground">{g.ideas}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-medium text-sm mb-3">💌 Modelos de Bilhete</h3>
        <div className="space-y-2">
          {KIT_CARD_TEMPLATES.map((t, i) => (
            <div key={i} className="rounded-xl bg-white/70 dark:bg-white/5 border border-amber-200/60 dark:border-amber-800/40 p-3 text-sm italic text-muted-foreground">
              "{t}"
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
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
    } catch {
      /* */
    }
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
      {title && (
        <p
          className={`text-sm font-medium mb-2 ${highlight ? "text-primary" : "text-muted-foreground"}`}
        >
          {title}
        </p>
      )}
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
