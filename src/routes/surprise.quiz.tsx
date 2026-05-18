import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccess } from "@/hooks/useAccess";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LABELS, type SurpriseAnswers } from "@/lib/surprise-types";
import { ANSWERS_KEY, clearPlanCache } from "@/lib/surprise-cache";
import { trackEvent } from "@/lib/meta-pixel";
import { AccessGateDenied, AccessGateLoading } from "@/components/surprise/AccessGate";
import { SurpriseShell } from "@/components/surprise/SurpriseShell";
import { BRAND_NAME } from "@/lib/brand";

export const Route = createFileRoute("/surprise/quiz")({
  head: () => ({ meta: [{ title: `Quiz — ${BRAND_NAME}` }] }),
  component: QuizPage,
});

type AnswersDraft = Partial<SurpriseAnswers>;

type Step = {
  key: keyof SurpriseAnswers;
  q: string;
  options: [string, string][];
  multi?: boolean;
  isText?: boolean;
};

function QuizPage() {
  const { hasSurprise, hydrated: accessHydrated } = useAccess();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswersDraft>({ likes: [] });
  const [answersHydrated, setAnswersHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ANSWERS_KEY);
      if (raw) setAnswers(JSON.parse(raw));
    } catch {
      /* */
    }
    setAnswersHydrated(true);
  }, []);

  useEffect(() => {
    if (answersHydrated) localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  }, [answers, answersHydrated]);

  if (!accessHydrated || !answersHydrated) return <AccessGateLoading />;
  if (!hasSurprise) return <AccessGateDenied />;

  const steps: Step[] = [
    { key: "recipient", q: "Para quem é a surpresa?", options: Object.entries(LABELS.recipient) },
    { key: "partnerName", q: "Qual o nome dela/dele?", options: [], isText: true },
    { key: "place", q: "Onde será a surpresa?", options: Object.entries(LABELS.place) },
    { key: "budget", q: "Qual seu orçamento?", options: Object.entries(LABELS.budget) },
    { key: "style", q: "Qual estilo você quer?", options: Object.entries(LABELS.style) },
    { key: "time", q: "Quanto tempo você tem para montar?", options: Object.entries(LABELS.time) },
    {
      key: "likes",
      q: "O que o casal mais gosta?",
      options: Object.entries(LABELS.likes),
      multi: true,
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const currentValue = answers[current.key];
  const canAdvance = current.isText
    ? true
    : current.multi
    ? Array.isArray(currentValue) && currentValue.length > 0
    : !!currentValue;

  function pick(value: string) {
    if (current.multi) {
      setAnswers((a) => {
        const arr = (a.likes ?? []) as string[];
        const exists = arr.includes(value);
        return {
          ...a,
          likes: (exists
            ? arr.filter((v) => v !== value)
            : [...arr, value]) as SurpriseAnswers["likes"],
        };
      });
    } else {
      setAnswers((a) => ({ ...a, [current.key]: value }));
    }
  }

  async function finish() {
    if (!answersHydrated) return;
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
    clearPlanCache();
    navigate({ to: "/surprise/plan" });
  }

  const progress = ((step + (canAdvance ? 1 : 0)) / steps.length) * 100;

  return (
    <SurpriseShell footer={false} mainClassName="max-w-2xl mx-auto px-4 py-8 sm:py-10">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Pergunta {step + 1} de {steps.length}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.key}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="mt-8"
        >
          <h1 className="font-display text-3xl sm:text-4xl">{current.q}</h1>
          {current.multi && (
            <p className="text-sm text-muted-foreground mt-1">Pode escolher mais de uma opção.</p>
          )}

          {current.isText ? (
            <div className="mt-6 space-y-3">
              <input
                type="text"
                autoFocus
                value={(answers.partnerName as string) ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, partnerName: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (isLast) void finish();
                    else setStep((s) => s + 1);
                  }
                }}
                placeholder="Ex: Ana, Maria, João..."
                className="w-full text-2xl font-display bg-transparent border-b-2 border-primary focus:outline-none py-3 placeholder:text-muted-foreground/40 transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                Opcional — mas deixa o plano muito mais especial ✨
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {current.options.map(([value, label]) => {
                const selected = current.multi
                  ? (answers.likes ?? []).includes(value as SurpriseAnswers["likes"][number])
                  : (answers[current.key] as string | undefined) === value;
                return (
                  <button
                    key={value}
                    onClick={() => pick(value)}
                    className={`p-4 rounded-2xl border text-sm text-left transition-all ${
                      selected
                        ? "border-primary bg-primary/10 text-foreground font-medium shadow-soft"
                        : "border-border bg-card hover:border-primary/40 hover:bg-card"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
            {!isLast ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>
                Próxima <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={finish} disabled={!canAdvance} size="lg">
                Gerar meu plano ✨
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </SurpriseShell>
  );
}
