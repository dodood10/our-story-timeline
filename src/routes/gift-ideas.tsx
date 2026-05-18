import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/hooks/useApp";
import { GIFT_IDEAS, HOBBIES, pickGifts } from "@/lib/gift-ideas";
import type { GiftQuizAnswers, GiftIdea } from "@/lib/types";
import { Gift, Heart, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FadeIn } from "@/components/common/FadeIn";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/gift-ideas")({
  head: () => ({
    meta: [
      { title: "Ideias de Presente — Memory Lane" },
      { name: "description", content: "Quiz para gerar ideias de presente personalizadas." },
    ],
  }),
  component: GiftPage,
});

function GiftPage() {
  const { giftFavorites, toggleGiftFavorite } = useApp();
  const [answers, setAnswers] = useState<GiftQuizAnswers>({
    hobby: "",
    style: "classic",
    budget: "mid",
  });
  const [results, setResults] = useState<GiftIdea[] | null>(null);

  function generate() {
    setResults(pickGifts(answers, 6));
  }

  const favorites = GIFT_IDEAS.filter((g) => giftFavorites.includes(g.id));

  return (
    <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto space-y-8">
      <PageHeader
        icon={Gift}
        title="Ideias de Presente"
        subtitle="Responda 3 perguntas e receba ideias personalizadas."
      />

      {!results ? (
        <section className="rounded-2xl bg-card border border-border p-6 shadow-card space-y-5">
          <div className="space-y-2">
            <Label>Hobby favorito do parceiro(a)</Label>
            <Select
              value={answers.hobby}
              onValueChange={(v) => setAnswers((a) => ({ ...a, hobby: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha um hobby" />
              </SelectTrigger>
              <SelectContent>
                {HOBBIES.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Estilo</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["classic", "modern", "adventurous"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setAnswers((a) => ({ ...a, style: s }))}
                  className={`p-3 rounded-xl border text-sm transition ${
                    answers.style === s
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {s === "classic" ? "Clássico" : s === "modern" ? "Moderno" : "Aventureiro"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Orçamento</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "mid", "high"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setAnswers((a) => ({ ...a, budget: b }))}
                  className={`p-3 rounded-xl border text-sm transition ${
                    answers.budget === b
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {b === "low" ? "Baixo $" : b === "mid" ? "Médio $$" : "Alto $$$"}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={generate} className="w-full" disabled={!answers.hobby}>
            <Gift className="h-4 w-4 mr-1.5" /> Gerar ideias
          </Button>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Ideias para vocês</h2>
            <Button variant="ghost" onClick={() => setResults(null)}>
              <RotateCcw className="h-4 w-4 mr-1" /> Refazer quiz
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {results.map((g, i) => (
              <FadeIn
                key={g.id}
                delay={i * 0.05}
                className="rounded-2xl bg-card border border-border p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-lg">{g.name}</p>
                  <button
                    onClick={() => toggleGiftFavorite(g.id)}
                    className={`shrink-0 ${giftFavorites.includes(g.id) ? "text-primary" : "text-muted-foreground"}`}
                    aria-label="Favoritar"
                  >
                    <Heart
                      className={`h-5 w-5 ${giftFavorites.includes(g.id) ? "fill-current" : ""}`}
                    />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{g.why}</p>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {favorites.length > 0 && (
        <section>
          <h2 className="font-display text-2xl mb-3">⭐ Favoritos salvos</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {favorites.map((g) => (
              <div key={g.id} className="rounded-2xl bg-card border border-primary/30 p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-lg">{g.name}</p>
                  <button onClick={() => toggleGiftFavorite(g.id)} className="text-primary">
                    <Heart className="h-5 w-5 fill-current" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{g.why}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
