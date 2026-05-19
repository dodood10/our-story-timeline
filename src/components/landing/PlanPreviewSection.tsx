import { Link } from "@tanstack/react-router";
import { Clock, Gauge, Heart, Home, Moon, Palette, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const CHIPS = [
  { icon: Heart, label: "Homenageada(o)", value: "Bianca" },
  { icon: Palette, label: "Estilo", value: "Estilo Pinterest" },
  { icon: Home, label: "Ambiente", value: "Casa inteira" },
  { icon: Clock, label: "Montagem", value: "2 horas" },
  { icon: Wallet, label: "Orçamento", value: "R$ 85,00 - R$ 100,00" },
  { icon: Gauge, label: "Dificuldade", value: "Caprichado" },
];

export function PlanPreviewSection() {
  return (
    <section className="py-16 sm:py-24 bg-secondary/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl leading-tight">
            Assim fica o plano dela — com o nome, o estilo e o orçamento de vocês
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Você responde um quiz rápido e recebe um roteiro montado para o casal, pronto para
            executar na noite do Dia dos Namorados.
          </p>
          <p className="mt-6 text-xs uppercase tracking-wider text-muted-foreground">
            Exemplo real do gerador · Plano Premium
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-card border border-border shadow-card overflow-hidden">
          {/* Fake browser chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/40">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 text-center text-xs text-muted-foreground font-mono">
              metodosurpresa.app/plano
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="text-center">
              <Heart className="h-6 w-6 text-primary fill-primary mx-auto" />
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                <Sparkles className="h-3 w-3" />
                Método Surpresa Perfeita™ · Plano Premium
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                Sua surpresa romântica está pronta
              </p>
              <p className="text-sm text-muted-foreground">
                Criado especialmente para <span className="text-primary font-medium">Bianca</span>
              </p>
              <h3 className="font-display text-2xl sm:text-3xl mt-3 leading-tight">
                O Plano da Noite Perfeita — Bianca
              </h3>
              <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Transforme os ambientes da casa em capítulos de uma história de afeto: uma jornada
                que começa na porta e termina em um ritual de massagem, com foco em detalhes
                manuais e curadoria musical para um clima Pinterest sem estourar o orçamento.
              </p>
            </div>

            <div className="mt-6 rounded-2xl bg-secondary/40 border border-border p-4 sm:p-5">
              <h4 className="font-display text-lg mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Seu plano em resumo
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {CHIPS.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl bg-background/80 border border-border/80 p-3 flex gap-2.5 items-start"
                  >
                    <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {label}
                      </p>
                      <p className="text-sm font-medium leading-snug mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
                <div className="rounded-xl bg-background/80 border border-border/80 p-3 flex gap-2.5 items-start col-span-2 sm:col-span-3">
                  <Moon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Clima da noite
                    </p>
                    <p className="text-sm font-medium leading-snug mt-0.5">
                      Íntimo, estético e relaxante
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {["Roteiro minuto a minuto", "Lista de compras", "Frases por momento"].map((t) => (
                <span
                  key={t}
                  className="text-xs rounded-full border border-border bg-background px-3 py-1 text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button asChild size="lg">
            <Link to="/surprise" search={{ plan: "premium" }}>
              Quero meu plano personalizado
            </Link>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">Acesso imediato após o pagamento</p>
        </div>
      </div>
    </section>
  );
}
