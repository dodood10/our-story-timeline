import { BRAND_NAME } from "@/lib/brand";

export { BRAND_NAME as LANDING_BRAND };

export const PROMO_END_DATE = new Date("2026-05-31T23:59:59");

export function isPreValentinesPromo(): boolean {
  return new Date() <= PROMO_END_DATE;
}

export const hero = {
  pill: BRAND_NAME,
  title: "Esse ano, ela vai lembrar pra sempre do que você fez no Dia dos Namorados.",
  subtitle:
    "Um método simples para transformar uma noite comum em uma experiência emocionante, íntima e inesquecível — mesmo que você não seja romântico ou criativo.",
  idealForLabel: "Ideal para homens que:",
  idealFor: [
    "estão sem ideias do que fazer",
    "querem sair da rotina",
    "querem emocionar de verdade",
    "querem fazer ela se sentir única nesse Dia dos Namorados",
  ],
  cta: "Quero Criar Uma Surpresa Inesquecível",
  microcopy: "Acesso imediato · Garantia de 7 dias",
  urgencyWarning:
    "A maioria dos homens deixa pra última hora… e acaba fazendo “mais do mesmo”.",
} as const;

export const curiosity = {
  title: "O que faz uma mulher nunca esquecer um momento?",
  negatives: [
    "Não é o valor do presente.",
    "Não é o restaurante caro.",
    "E nem flores compradas no impulso.",
  ],
  insight:
    "O que realmente marca uma mulher emocionalmente é a experiência que ela sente vivendo aquele momento. O cuidado. Os detalhes. A sensação de: “Ele realmente pensou em mim.”",
  payoff: `E é exatamente isso que o ${BRAND_NAME} foi criado para fazer.`,
} as const;

export const scene = {
  title: "Imagine a noite de 12 de junho…",
  paragraphs: [
    "Ela chega sem imaginar nada.",
    "O ambiente começa diferente. A música. Os detalhes. As pequenas surpresas acontecendo aos poucos.",
    "No começo ela sorri. Depois ela percebe que aquilo não foi algo improvisado. Foi pensado. Planejado. Criado especialmente pra ela.",
    "E então acontece a reação que quase todo homem quer ver: aquele olhar emocionado que diz tudo sem precisar falar.",
    "Porque pela primeira vez em muito tempo… não parece “só mais um Dia dos Namorados”. Parece um momento que ela vai carregar pra sempre.",
  ],
} as const;

export const problem = {
  title: "O problema NÃO é você.",
  reframes: [
    "Você não é frio.",
    "Não é sem criatividade.",
    "E provavelmente também não deixou de amar ela.",
  ],
  intro: "O problema é que ninguém nunca ensinou como criar experiências emocionais de verdade.",
  bullets: [
    "o mesmo jantar de sempre",
    "o presente genérico",
    "flores de última hora",
    "algo bonito… mas esquecível",
  ],
  feelings: [
    "“Será que isso ainda emociona ela?”",
    "Ou pior: a sensação de que o relacionamento entrou na rotina.",
  ],
  conclusion: "Não é falta de amor.\nÉ falta de método.",
  methodIntro: {
    lead: `Foi por isso que eu criei o ${BRAND_NAME}:`,
    description:
      "Um passo a passo simples pensado para ajudar qualquer homem a criar uma surpresa marcante, íntima e inesquecível.",
    tags: ["Mesmo sem experiência.", "Mesmo sem criatividade.", "Mesmo sem gastar absurdamente."],
  },
} as const;

export const deliverablesSummary = {
  title: "O que você vai receber",
  subtitle: "Dentro do método você terá acesso a:",
  bullets: [
    "Ideias organizadas por tipo de surpresa",
    "Passo a passo simples de execução",
    "Plano personalizado pelo seu quiz (gerador com IA)",
    "Frases e mensagens emocionais prontas (Premium)",
    "Sequência ideal da surpresa — roteiro hora a hora",
    "Guia de decoração e clima em casa",
    "Lista de compras dentro do seu orçamento",
    "Estratégias simples que aumentam o impacto emocional da experiência",
  ],
} as const;

export const deliverables = {
  title: "Tudo isso, detalhado no seu plano",
  subtitle:
    "Cada compra libera o gerador: você responde um quiz rápido e recebe um plano montado para o seu casal — não é PDF genérico.",
  closing:
    "8 entregas no Premium · Essencial no Básico · Por menos do que custa uma sobremesa de restaurante.",
  items: [
    {
      n: 1,
      emoji: "🎯",
      title: "O Roteiro da Noite Perfeita (Minuto a Minuto)",
      description:
        "Você sabe exatamente o que fazer desde o momento em que ela chega até o final da noite — sem aquele silêncio constrangedor depois do jantar.",
      tier: "all" as const,
    },
    {
      n: 2,
      emoji: "🏠",
      title: 'Guia de Decoração Romântica "Sem Erro"',
      description:
        "Como transformar sua sala ou quarto num ambiente especial — usando o que você já tem em casa ou gastando pouco.",
      tier: "all" as const,
    },
    {
      n: 3,
      emoji: "🛒",
      title: "Lista de Compras Inteligente",
      description:
        "Vá ao mercado com a lista no celular, dentro do orçamento que você escolheu no quiz. Sem errar, sem esquecer.",
      tier: "all" as const,
    },
    {
      n: 4,
      emoji: "🍽️",
      title: "Ideias de Jantar Simples",
      description:
        "Sugestões fáceis de fazer em casa, no seu estilo e orçamento — mesmo se você não cozinha muito.",
      tier: "premium" as const,
    },
    {
      n: 5,
      emoji: "💌",
      title: "6 Frases Românticas Prontas",
      description:
        "Frases prontas para bilhete ou declaração — só adapta o nome dela. As palavras certas sem travar na hora de escrever.",
      tier: "premium" as const,
    },
    {
      n: 6,
      emoji: "📋",
      title: "Checklist Final + PDF",
      description:
        "Marque o que já fez e baixe o plano no celular ou imprima. Nada escapa na hora H.",
      tier: "premium" as const,
    },
    {
      n: 7,
      emoji: "⚡",
      title: "Plano Emergência de 1 Hora",
      description:
        "Deixou pra última hora? Tem um plano que cabe em 60 minutos e ainda funciona.",
      tier: "premium" as const,
    },
    {
      n: 8,
      emoji: "📱",
      title: "Acesso vitalício",
      description:
        "Usa no Dia dos Namorados, no aniversário, no mêsversário. Cada quiz refeito gera um plano novo.",
      tier: "all" as const,
    },
  ],
} as const;

export const howItWorks = {
  title: "Como funciona",
  subtitle: "Simples. Rápido. Natural.",
  steps: [
    {
      n: "1",
      title: "Escolha o estilo da surpresa",
      description:
        "Depois da compra, um quiz rápido pergunta sobre vocês, o lugar e o orçamento. A IA monta o plano que combina com vocês.",
    },
    {
      n: "2",
      title: "Siga o passo a passo",
      description:
        "Roteiro, lista de compras, decoração e frases (no Premium) — tudo organizado de forma simples e prática.",
    },
    {
      n: "3",
      title: "Veja a reação dela",
      description:
        "Você cria uma experiência emocional muito mais forte do que apenas entregar um presente.",
    },
  ],
} as const;

export const benefits = {
  title: "O que esse método ajuda você a criar",
  items: [
    "Mais conexão no relacionamento",
    "Um momento realmente memorável",
    "Reações emocionais genuínas",
    "Uma experiência muito mais marcante do que presentes comuns",
    "A sensação de que ela é única pra você",
    "Um Dia dos Namorados que não cai na rotina",
  ],
} as const;

export const testimonials = {
  title: "Homens comuns criando momentos inesquecíveis",
  items: [
    {
      text: "Achei que ela fosse achar exagerado… mas ela começou a chorar quando viu tudo pronto. Foi o melhor Dia dos Namorados que já tivemos.",
      name: "Rafael M.",
      context: "",
    },
    {
      text: "Eu nunca fui criativo pra essas coisas. Segui o passo a passo e ela ficou completamente emocionada.",
      name: "Lucas A.",
      context: "",
    },
    {
      text: "Pela primeira vez eu senti que fiz algo realmente especial pra ela.",
      name: "Felipe R.",
      context: "",
    },
  ],
} as const;

export const objection = {
  title: "“Mas isso funciona mesmo se eu não for romântico?”",
  intro: "Sim. Porque você não precisa inventar nada sozinho.",
  bullets: [
    "não sabem o que fazer",
    "estão sem ideias",
    "querem surpreender",
    "mas não têm criatividade ou experiência",
  ],
  bulletsLead: "O método foi criado justamente para homens comuns que:",
  closing: "Você só segue o processo.",
} as const;

export const pricing = {
  title: "Escolha como ela vai lembrar desse Dia dos Namorados",
  promoBefore:
    "Promoção de pré-Dia dos Namorados. Esse preço vale até 31/05. A partir de 01/06, o Premium volta para R$39,90.",
  promoAfter: "Preço promocional encerrado. O Premium está disponível por R$39,90.",
  basicTagline: "Pra quem quer o essencial e montar o resto com o que o plano já entrega.",
  premiumTagline: "A experiência completa. Zero margem de erro nessa noite.",
  basicCardFeatures: [
    "Método principal (gerador + quiz)",
    "Passo a passo completo",
    "Roteiro, decoração e lista de compras",
    "Acesso imediato",
  ],
  premiumCardFeatures: [
    "Tudo do Básico",
    "6 frases românticas prontas",
    "Ideias de jantar + plano emergência 1h",
    "Checklist e PDF do plano",
    "Acesso vitalício ao gerador",
  ],
  premiumCta: "Quero Fazer Ela Nunca Esquecer Esse Dia",
  anchor:
    "Um jantar fora custa fácil R$300 pra dois — e termina igual ao do ano passado. Aqui você monta uma noite que ela vai lembrar, com plano personalizado por IA.",
  trustLine: "Acesso imediato · Acesso vitalício (Premium) · Garantia de 7 dias",
  urgency: {
    title: "O Dia dos Namorados está chegando.",
    paragraphs: [
      "E quanto mais perto do dia 12… menos tempo você tem para criar algo realmente especial.",
      "A maioria deixa pra última hora. Os homens que criam momentos inesquecíveis… se preparam antes.",
    ],
  },
  guarantee: {
    title: "Teste sem risco",
    body: "Você terá 7 dias de garantia para acessar o método e ver tudo por dentro. Se sentir que isso não vai ajudar você a criar uma experiência inesquecível… é só pedir reembolso. Simples assim.",
  },
} as const;

export const faqItems = [
  {
    q: "Preciso responder um quiz antes de comprar?",
    a: "Não. Você compra direto, recebe acesso imediato, e dentro do site tem um quiz rápido para personalizar. Sem fricção, sem espera.",
  },
  {
    q: "Esse plano é realmente personalizado ou é o mesmo pra todo mundo?",
    a: "Cada combinação de respostas do quiz gera um plano diferente pela IA. Dois clientes com respostas diferentes recebem planos completamente diferentes.",
  },
  {
    q: "Vai funcionar mesmo se eu deixei pra última hora?",
    a: "Sim. O Premium inclui um plano emergência de 1 hora pensado exatamente pra isso.",
  },
  {
    q: "E se eu pagar e não gostar?",
    a: "Você tem 7 dias de garantia. Não gostou, devolvemos o dinheiro sem pergunta.",
  },
  {
    q: "Eu preciso saber cozinhar?",
    a: "Não. As ideias de jantar incluem opções simples — você escolhe o que cabe no seu tempo e habilidade.",
  },
  {
    q: "Posso refazer o quiz?",
    a: "Pode quantas vezes quiser. Cada vez que muda as respostas, gera um plano novo.",
  },
  {
    q: "Recebo um produto físico?",
    a: "Não — é 100% digital. Justamente por isso o investimento é tão baixo.",
  },
] as const;

export const finalCta = {
  title: "No dia 12 de junho…",
  paragraphs: [
    "ela pode receber algo genérico como em todos os anos.",
    "Ou viver uma experiência tão emocional que vai lembrar desse momento por muito tempo.",
    "A decisão é sua.",
  ],
  cta: "Quero Criar Uma Memória Inesquecível",
  microcopy: "Acesso imediato · Garantia de 7 dias · A partir de R$10",
} as const;

export const footer = {
  brand: BRAND_NAME,
  tagline: "Feito com ❤️",
} as const;
