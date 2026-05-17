import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccess } from "@/hooks/useAccess";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Heart, Lock } from "lucide-react";
import { LABELS, type SurpriseAnswers } from "@/lib/surprise-types";

export const Route = createFileRoute("/surprise/quiz")({
  head: () => ({ meta: [{ title: "Quiz — Surpresa Romântica" }] }),
  component: QuizPage,
});

type AnswersDraft = Partial<SurpriseAnswers>;

const STORAGE_KEY = "ml.surprise.answers";

type Step = {
  key: keyof SurpriseAnswers;
  q: string;
  options: [string, string][];
  multi?: boolean;
};

function QuizPage() {
  const { hasSurprise } = useAccess();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswersDraft>({ likes: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAnswers(JSON.parse(raw));
    } catch { /* */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers, hydrated]);

  if (!hasSurprise) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-card border border-border rounded-3xl p-8 shadow-card">
          <Lock className="h-10 w-10 text-primary mx-auto" />
          <h1 className="font-display text-2xl mt-4">Acesso restrito</h1>
          <p className="text-muted-foreground mt-2">Você precisa de um plano para usar o gerador.</p>
          <Button asChild className="w-full mt-6"><Link to="/surprise">Ver planos</Link></Button>
        </div>
      </div>
    );
  }

  const steps: Step[] = [
    { key: "recipient", q: "Para quem é a surpresa?", options: Object.entries(LABELS.recipient) },
    { key: "place", q: "Onde será a surpresa?", options: Object.entries(LABELS.place) },
    { key: "budget", q: "Qual seu orçamento?", options: Object.entries(LABELS.budget) },
    { key: "style", q: "Qual estilo você quer?", options: Object.entries(LABELS.style) },
    { key: "time", q: "Quanto tempo você tem para montar?", options: Object.entries(LABELS.time) },
    { key: "likes", q: "O que o casal mais gosta?", options: Object.entries(LABELS.likes), multi: true },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const currentValue = answers[current.key];
  const canAdvance = current.multi
    ? Array.isArray(currentValue) && currentValue.length > 0
    : !!currentValue;

  function pick(value: string) {
    if (current.multi) {
      setAnswers((a) => {
        const arr = (a.likes ?? []) as string[];
        const exists = arr.includes(value);
        return { ...a, likes: (exists ? arr.filter((v) => v !== value) : [...arr, value]) as SurpriseAnswers["likes"] };
      });
    } else {
      setAnswers((a) => ({ ...a, [current.key]: value }));
    }
  }

  async function finish() {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    localStorage.removeItem("ml.surprise.plan");
    navigate({ to: "/surprise/plan" });
  }

  const progress = ((step + (canAdvance ? 1 : 0)) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-soft px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/surprise" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <Heart className="h-4 w-4 text-primary" /> Surpresa Romântica
        </Link>

        <div className="mt-6 mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Pergunta {step + 1} de {steps.length}</span>
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

            <div className="mt-8 flex justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
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
      </div>
    </div>
  );
}
