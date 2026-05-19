import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAccess } from "@/hooks/useAccess";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Download, Heart, Lock, MessageCircle, RotateCcw } from "lucide-react";
import { generateSurprisePlan } from "@/lib/surprise.functions";
import {
  SurpriseAnswersSchema,
  PLAN_STYLE_THEMES,
  type SurpriseAnswers,
  type SurprisePlan,
} from "@/lib/surprise-types";
import { ANSWERS_KEY, readCachedPlan, writeCachedPlan, clearPlanCache } from "@/lib/surprise-cache";
import { trackEvent } from "@/lib/meta-pixel";
import {
  AccessGateDenied,
  AccessGateLoading,
  AccessGateSurpriseBlocked,
} from "@/components/surprise/AccessGate";
import { SurpriseShell } from "@/components/surprise/SurpriseShell";
import { BRAND_NAME } from "@/lib/brand";
import { PlanResultView } from "@/components/surprise/plan/PlanResultView";
import { PlanSectionNav } from "@/components/surprise/plan/PlanSectionNav";
import { PlanFeedback } from "@/components/surprise/plan/PlanFeedback";
import { planToText } from "@/components/surprise/plan/planToText";
import { PLAN_COPY } from "@/components/surprise/plan/plan-copy";

export const Route = createFileRoute("/surprise/plan")({
  head: () => ({ meta: [{ title: `Seu plano — ${BRAND_NAME}` }] }),
  component: PlanPage,
});

const LOADING_MESSAGES = [
  { emoji: "✨", text: "Analisando suas preferências..." },
  { emoji: "🎨", text: "Montando o mapa da noite..." },
  { emoji: "🛒", text: "Calculando sua lista inteligente..." },
  { emoji: "💌", text: "Escrevendo frases por momento..." },
  { emoji: "📋", text: "Finalizando o cronograma..." },
];

function PlanPage() {
  const { isPremium, hydrated, canUseSurprise, productMode } = useAccess();
  const navigate = useNavigate();
  const generate = useServerFn(generateSurprisePlan);
  const tier = isPremium ? "premium" : "basic";
  const [plan, setPlan] = useState<SurprisePlan | null>(null);
  const [answers, setAnswers] = useState<SurpriseAnswers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const printRef = useRef<HTMLDivElement>(null);
  const loadKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length), 2000);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => {
    if (!loading) return;
    setLoadProgress(0);
    const start = Date.now();
    const t = setInterval(() => {
      const elapsed = Date.now() - start;
      setLoadProgress(92 * (1 - Math.exp(-elapsed / 7000)));
    }, 150);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => {
    if (!showReveal) return;
    const t = setTimeout(() => setShowReveal(false), 3500);
    return () => clearTimeout(t);
  }, [showReveal]);

  useEffect(() => {
    if (plan && !loading) {
      trackEvent("ViewContent", {
        content_name: "Plano Surpresa Romantica",
        content_category: tier,
        value: isPremium ? 19.9 : 10.0,
        currency: "BRL",
      });
    }
  }, [plan, loading, tier, isPremium]);

  useEffect(() => {
    if (!hydrated) return;
    if (!canUseSurprise) {
      navigate({ to: productMode === "memory_lane_only" ? "/app" : "/surprise" });
      return;
    }
    if (loadKeyRef.current === tier) return;
    loadKeyRef.current = tier;

    try {
      const rawAnswers = localStorage.getItem(ANSWERS_KEY);
      if (rawAnswers) {
        const partial = JSON.parse(rawAnswers) as Record<string, unknown>;
        setAnswers(SurpriseAnswersSchema.parse({ ...partial, tier }));
      }
    } catch {
      /* */
    }

    const cached = readCachedPlan(tier);
    if (cached) {
      setPlan(cached);
      setLoading(false);
      return;
    }
    void doGenerate();
  }, [hydrated, canUseSurprise, productMode, tier, navigate]);

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
      const data = SurpriseAnswersSchema.parse({ ...partial, tier });
      setAnswers(data);
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
  if (productMode === "memory_lane_only") return <AccessGateSurpriseBlocked />;
  if (!canUseSurprise) return <AccessGateDenied />;

  async function copyAll() {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(planToText(plan));
      toast.success("Plano copiado!");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  }

  function shareWhatsApp() {
    const phrase = plan?.phrasesByMoment?.whatsapp?.trim();
    const text = phrase || "Preparei uma surpresa especial para você. Vem logo!";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
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
        scale: 2.5,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(img, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(img, "PNG", 0, position, imgWidth, imgHeight);
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
          <div className="mt-8 w-full">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${loadProgress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <p className="text-muted-foreground text-xs text-center mt-3">
              Isso leva uns 15–20 segundos.
            </p>
          </div>
        </div>
      </SurpriseShell>
    );
  }

  const partnerName = answers?.partnerName;
  const planStyle = answers?.style ?? "";

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
            className="font-display text-3xl sm:text-4xl mt-6 leading-tight"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {PLAN_COPY.revealTitle}
          </motion.p>
          <motion.p
            className="text-lg mt-3 text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            {PLAN_COPY.revealSubtitle(partnerName)}
          </motion.p>
          <motion.p
            className="text-muted-foreground mt-2 text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            Agora é só seguir o mapa da noite — passo a passo.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
            <Button className="mt-8" onClick={() => setShowReveal(false)}>
              {PLAN_COPY.revealCta}
            </Button>
          </motion.div>
        </motion.div>
      </SurpriseShell>
    );
  }

  if (error || !plan || !answers) {
    return (
      <SurpriseShell footer={false} mainClassName="flex items-center justify-center px-4 py-16">
        <div className="max-w-md text-center bg-card border border-border rounded-3xl p-8 shadow-card">
          <p className="font-display text-2xl">Algo deu errado</p>
          <p className="text-muted-foreground mt-2">{error ?? "Tente gerar novamente."}</p>
          <div className="mt-6 flex gap-2 justify-center flex-wrap">
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

  const themeClass = PLAN_STYLE_THEMES[planStyle] ?? "";

  return (
    <SurpriseShell footer={false} mainClassName="max-w-3xl mx-auto px-4 py-6 sm:py-10 pb-24">
      <div className="flex items-center justify-between gap-2 mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/surprise/quiz">
            <ArrowLeft className="h-4 w-4 mr-1" /> Refazer quiz
          </Link>
        </Button>
        <div className="flex gap-1.5">
          <Button variant="ghost" size="sm" onClick={regenerate} title="Gerar novo plano">
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline ml-1.5">Regenerar</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={shareWhatsApp}
            title="Compartilhar no WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline ml-1.5">WhatsApp</span>
          </Button>
          <Button variant="outline" size="sm" onClick={copyAll}>
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline ml-1.5">Copiar</span>
          </Button>
          {isPremium ? (
            <Button size="sm" onClick={downloadPdf}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5">PDF</span>
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5">PDF</span>
            </Button>
          )}
        </div>
      </div>

      <PlanSectionNav />

      <div
        ref={printRef}
        className={`bg-card border border-border rounded-3xl p-5 sm:p-10 shadow-card ${themeClass}`}
      >
        <PlanResultView plan={plan} answers={answers} isPremium={isPremium} />
      </div>

      <PlanFeedback />

      {!isPremium && (
        <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 text-center">
          <p className="font-display text-xl">{PLAN_COPY.upgradeTitle}</p>
          <p className="text-sm text-muted-foreground mt-1">{PLAN_COPY.upgradeBody}</p>
          <Button asChild className="mt-4">
            <Link to="/surprise" search={{ plan: "premium" }}>
              Upgrade por R$19,90
            </Link>
          </Button>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t border-border bg-background/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-2">
        <Button variant="outline" className="flex-1" size="sm" onClick={shareWhatsApp}>
          <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
        </Button>
        <Button variant="outline" className="flex-1" size="sm" onClick={copyAll}>
          <Copy className="h-4 w-4 mr-1" /> Copiar
        </Button>
      </div>
    </SurpriseShell>
  );
}
