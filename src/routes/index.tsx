import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Heart,
  Sparkles,
  CheckCircle2,
  Clock,
  ShoppingBag,
  ListChecks,
  MessageCircleHeart,
  UtensilsCrossed,
  Zap,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Surpresa Romântica em minutos — Dia dos Namorados 2026" },
      {
        name: "description",
        content:
          "Responda um quiz rápido e receba um plano completo de surpresa romântica com decoração, lista de compras, roteiro e frases prontas — em minutos.",
      },
      { property: "og:title", content: "Surpresa Romântica em minutos" },
      {
        property: "og:description",
        content: "Decoração, lista de compras, roteiro e frases prontas. Tudo personalizado pela IA.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <MarketingHeader />
      <Hero />
      <PainSection />
      <SolutionSection />
      <WhatYouGetSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <FinalCta />
      <Footer />
    </div>
  );
}

function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary fill-primary/20" strokeWidth={1.8} />
          <span className="font-display text-lg">Surpresa Romântica</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#como-funciona" className="hover:text-foreground transition">Como funciona</a>
          <a href="#precos" className="hover:text-foreground transition">Preços</a>
          <a href="#faq" className="hover:text-foreground transition">FAQ</a>
        </nav>
        <Button asChild size="sm">
          <Link to="/surprise">Criar surpresa</Link>
        </Button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-romantic opacity-40 -z-10" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Sparkles className="h-3 w-3" /> Especial Dia dos Namorados 2026
          </span>
          <h1 className="font-display text-4xl sm:text-6xl mt-5 leading-[1.05] tracking-tight">
            Monte uma <span className="text-gradient-romantic">surpresa romântica</span> inesquecível em casa em poucos minutos
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-5 max-w-2xl mx-auto">
            Responda um quiz rápido e receba um <strong className="text-foreground">plano personalizado</strong> com decoração, lista de compras, frases românticas e roteiro completo da noite — mesmo sem criatividade e gastando pouco.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button asChild size="lg" className="text-base px-7 h-12">
              <Link to="/surprise">
                Criar minha surpresa agora <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">⏱ Leva menos de 3 minutos</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto"
        >
          {[
            { n: "2.000+", l: "casais surpreendidos" },
            { n: "4,9 ★", l: "avaliação média" },
            { n: "<3 min", l: "para gerar" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-card border border-border p-3 sm:p-4">
              <p className="font-display text-xl sm:text-2xl text-primary">{s.n}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const pains = [
  "Está sem ideia para o Dia dos Namorados?",
  "Restaurante está caro ou lotado?",
  "Quer surpreender sem gastar muito?",
  "Deixou para a última hora?",
  "Não sabe como decorar o quarto, sala ou mesa?",
];

function PainSection() {
  return (
    <section className="py-16 sm:py-24 bg-card/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-3xl sm:text-4xl text-center">Soa familiar?</h2>
        <ul className="mt-8 space-y-3">
          {pains.map((p, i) => (
            <motion.li
              key={p}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border"
            >
              <span className="text-2xl">😩</span>
              <span className="pt-0.5">{p}</span>
            </motion.li>
          ))}
        </ul>
        <p className="text-center mt-8 text-lg">A gente resolve isso em <strong>3 passos</strong> 👇</p>
      </div>
    </section>
  );
}

function SolutionSection() {
  const steps = [
    { n: "1", t: "Responda o quiz", d: "6 perguntas rápidas sobre o casal, o local e o orçamento." },
    { n: "2", t: "Nossa IA monta o plano", d: "Em segundos você recebe a surpresa completa, do conceito ao roteiro." },
    { n: "3", t: "Execute com confiança", d: "Lista de compras, passo a passo e frases prontas. Você só precisa caprichar." },
  ];
  return (
    <section id="como-funciona" className="py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl">Como funciona</h2>
          <p className="text-muted-foreground mt-3">Um gerador pensado para quem não tem tempo nem talento de decorador.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-card relative"
            >
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-lg">
                {s.n}
              </div>
              <h3 className="font-display text-xl mt-4">{s.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const benefits = [
  { icon: Sparkles, t: "Conceito da surpresa", d: "Uma proposta única para a sua noite, com clima e narrativa." },
  { icon: Heart, t: "Plano de decoração", d: "Como montar o ambiente, iluminação, fotos e mesa." },
  { icon: ShoppingBag, t: "Lista de compras", d: "Essencial e opcional, dentro do seu orçamento." },
  { icon: Clock, t: "Passo a passo", d: "Roteiro com horários — você não esquece nada." },
  { icon: MessageCircleHeart, t: "Frases românticas", d: "6 frases prontas pra usar em bilhetes e cartões." },
  { icon: UtensilsCrossed, t: "Ideias de jantar", d: "Sugestões fáceis, de acordo com o estilo do casal." },
  { icon: Zap, t: "Plano emergência 1h", d: "Para quem deixou em cima da hora. Funciona." },
];

function WhatYouGetSection() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-soft">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl">O que você recebe</h2>
          <p className="text-muted-foreground mt-3">Um plano completo, pronto para executar, em PDF para baixar.</p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.t}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl bg-card border border-border p-5 shadow-card"
              >
                <Icon className="h-5 w-5 text-primary" />
                <p className="font-display text-lg mt-3">{b.t}</p>
                <p className="text-sm text-muted-foreground mt-1">{b.d}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const items = [
    { n: "Marina, 28", t: "Fiz tudo em 1h, achei que ia ser ruim e o Léo amou. As frases prontas salvaram." },
    { n: "Rafael, 34", t: "Sou péssimo nessas coisas. O plano me disse exatamente o que comprar e onde colocar." },
    { n: "Bia, 31", t: "Gastei R$73, ficou lindo. Vou usar pro nosso aniversário também." },
  ];
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-3xl sm:text-4xl text-center">O que dizem por aí</h2>
        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {items.map((it, i) => (
            <motion.div
              key={it.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed">"{it.t}"</p>
              <p className="mt-3 text-xs text-muted-foreground">— {it.n}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="precos" className="py-16 sm:py-24 bg-card/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl">Escolha o seu plano</h2>
          <p className="text-muted-foreground mt-3">Pagamento único. Sem mensalidade.</p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <PricingCard
            name="Básico"
            price="10"
            highlight={false}
            features={[
              "Gerador de surpresa personalizada",
              "Decoração por ambiente",
              "Lista de compras",
              "Roteiro simples da noite",
            ]}
          />
          <PricingCard
            name="Premium"
            price="19,90"
            highlight
            badge="Mais escolhido"
            features={[
              "Tudo do Básico, mais:",
              "Frases românticas prontas",
              "Cartões imprimíveis",
              "Ideias de jantar",
              "Plano emergência de 1h",
              "Checklist completo",
              "Exportação em PDF",
              "Bônus: 20 ideias extras",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  name,
  price,
  features,
  highlight,
  badge,
}: {
  name: string;
  price: string;
  features: string[];
  highlight: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`relative rounded-3xl p-7 border ${
        highlight
          ? "border-primary bg-card shadow-soft scale-[1.02]"
          : "border-border bg-card"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium">
          {badge}
        </span>
      )}
      <p className="font-display text-2xl">{name}</p>
      <p className="mt-3">
        <span className="font-display text-5xl">R${price}</span>
        <span className="text-sm text-muted-foreground ml-1">/ único</span>
      </p>
      <ul className="mt-6 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-sm">
            <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button asChild className="w-full mt-7" variant={highlight ? "default" : "outline"}>
        <Link to="/surprise">Quero o {name}</Link>
      </Button>
    </div>
  );
}

function FaqSection() {
  const items = [
    {
      q: "Eu recebo o plano na hora?",
      a: "Sim. Logo após responder o quiz, a nossa IA gera o plano completo em segundos, direto na tela.",
    },
    {
      q: "Funciona se eu tiver pouco tempo?",
      a: "Sim. Você diz quanto tempo tem e o plano se adapta. O Premium inclui um 'plano emergência de 1h'.",
    },
    {
      q: "Posso baixar em PDF?",
      a: "Sim, no plano Premium. Você baixa, imprime ou compartilha o plano no celular.",
    },
    {
      q: "Preciso ter habilidades manuais?",
      a: "Não. Cada passo é descrito em linguagem simples, e a lista de compras é toda de itens fáceis de achar.",
    },
    {
      q: "Posso refazer o quiz?",
      a: "Pode, quantas vezes quiser. Gere planos diferentes para encontrar a vibe perfeita.",
    },
  ];
  return (
    <section id="faq" className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-3xl sm:text-4xl text-center">Perguntas frequentes</h2>
        <Accordion type="single" collapsible className="mt-8">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{it.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <Heart className="h-10 w-10 text-primary mx-auto animate-float-heart fill-primary/20" />
        <h2 className="font-display text-3xl sm:text-5xl mt-4">
          Faça este Dia dos Namorados ser <span className="text-gradient-romantic">inesquecível</span>
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Em 3 minutos você sai daqui com um plano pronto. Sem stress, sem improviso.
        </p>
        <Button asChild size="lg" className="mt-8 text-base px-7 h-12">
          <Link to="/surprise">
            <ListChecks className="h-4 w-4 mr-1.5" /> Criar minha surpresa agora
          </Link>
        </Button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Surpresa Romântica. Feito com 💖</p>
        <div className="flex gap-4">
          <Link to="/dev-unlock" className="hover:text-foreground transition">Acesso de teste</Link>
        </div>
      </div>
    </footer>
  );
}
