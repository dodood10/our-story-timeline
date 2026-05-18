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
    "Sem precisar virar uma pessoa criativa da noite pro dia. Sem clichê de restaurante. Sem gastar uma fortuna.",
  checkmarks: [
    "Roteiro hora a hora da noite",
    "Lista de compras inteligente",
    "Guia de decoração sem erro",
    "6 frases românticas prontas (Premium)",
  ],
  cta: "Quero surpreender ela esse ano",
  microcopy: "Acesso imediato · Garantia de 7 dias",
} as const;

export const trustBadges = [
  "Funciona pra casais novos e antigos",
  "Em casa, apartamento ou hotel",
  "Heterossexual e LGBT+",
  'Mesmo se você "não é romântico"',
] as const;

export const trustStats = [
  { value: "2.000+", label: "casais surpreendidos" },
  { value: "4,9 ★", label: "avaliação média" },
  { value: "< 3 min", label: "pra personalizar" },
] as const;

export const scene = {
  title: "Imagine a noite de 12 de junho.",
  paragraphs: [
    'Ela chega em casa esperando o de sempre. Talvez um "vamos jantar fora?". Talvez nem isso.',
    "Mas hoje, quando ela abre a porta, a sala está com luz baixa. A música certa tocando. Tem um bilhete na mesa — escrito à mão — com palavras que ela nunca imaginou que viriam de você. O cheiro da comida que você preparou. Detalhes pequenos que mostram que você pensou nela durante dias.",
    'Ela te olha diferente naquela noite. E nos meses seguintes, quando contar pras amigas, vai começar com: "você não vai acreditar no que ele fez…"',
  ],
  quote: "As pessoas esquecem presentes.\nMas nunca esquecem como se sentiram.",
} as const;

export const problem = {
  title: "O Problema NÃO É VOCÊ.",
  subtitle:
    'Você não é "ruim em surpresa". Você não é "pouco romântico". Você só nunca teve alguém que pensasse cada detalhe por você.',
  bullets: [
    "Já tentou planejar algo especial e travou no meio do caminho",
    "Não sabe o que escrever num bilhete sem parecer brega ou forçado",
    'Sempre acaba no mesmo restaurante porque "não tem ideia melhor"',
    "Tem medo de tentar algo diferente e dar errado na frente dela(e)",
    'Vê surpresas dos amigos nas redes sociais e pensa "como ele teve essa ideia?"',
    "Já decepcionou ela(e) em datas importantes e carrega isso até hoje",
  ],
  conclusion: "Não é falta de amor.\nÉ falta de método.",
  transition: "Esse método agora existe. Continua lendo. 👇",
} as const;

export const howItWorks = {
  title: "Como funciona — do clique à execução",
  subtitle: "Sem espera. Sem fricção. Você sai daqui com tudo na mão.",
  steps: [
    {
      n: "1",
      title: "Comprou, liberou",
      description: "Pagamento aprovado em segundos. Acesso imediato ao gerador na hora.",
    },
    {
      n: "2",
      title: "Personalize em 3 cliques",
      description:
        "Um quiz rápido pergunta sobre vocês, o lugar e o orçamento. Em segundos, seu plano fica personalizado pro seu casal.",
    },
    {
      n: "3",
      title: "Execute com confiança",
      description:
        "Lista de compras pronta, frases pra usar, passo a passo cronometrado. Você só precisa seguir.",
    },
  ],
} as const;

export const deliverables = {
  title: "As 8 entregas que vão fazer ela te olhar diferente",
  subtitle:
    "Um método completo, pensado pra você não precisar pensar em nenhum detalhe — personalizado pela IA pro seu casal.",
  closing:
    "8 entregas no Premium · Essencial no Básico · Por menos do que custa uma sobremesa de restaurante.",
  items: [
    {
      n: 1,
      emoji: "🎯",
      title: "O Roteiro da Noite Perfeita (Minuto a Minuto)",
      description:
        "Você sabe aquele momento de silêncio constrangedor depois do jantar, quando ninguém sabe o que fazer? Acabou. O roteiro te diz exatamente o que fazer desde o momento em que ela chega até o final da noite.",
      tier: "all" as const,
    },
    {
      n: 2,
      emoji: "🏠",
      title: 'Guia de Decoração Romântica "Sem Erro"',
      description:
        "Como transformar sua sala ou quarto num ambiente especial — usando o que você já tem em casa ou gastando pouco. Ela vai entrar e ficar em silêncio por um segundo.",
      tier: "all" as const,
    },
    {
      n: 3,
      emoji: "🛒",
      title: "Lista de Compras Inteligente",
      description:
        "Você vai ao mercado com a lista no celular. Não erra, não esquece, não compra caro. Em 30 minutos você sai do supermercado com tudo que precisa.",
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
        "A maioria trava na hora de escrever. Aqui você tem frases prontas — só adapta o nome dela(e). As palavras certas pra fazer ela(e) parar por um segundo quando ler.",
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
        "Pra quem deixou pra última hora. Comprou às 17h? Tem um plano que cabe em 60 minutos e ainda funciona.",
      tier: "premium" as const,
    },
    {
      n: 8,
      emoji: "📱",
      title: "Acesso vitalício",
      description:
        "Usa no Dia dos Namorados. Depois usa no aniversário. Cada quiz refeito gera um plano novo. Você compra uma vez, surpreende o ano inteiro.",
      tier: "all" as const,
    },
  ],
} as const;

export const qualification = {
  title: "Esse método é pra você?",
  forYou: [
    "Você ama ela(e) mas sabe que não é a pessoa mais criativa quando o assunto é surpresa",
    "Tem uma sensação de que está devendo um gesto há mais tempo do que gostaria",
    "Quer fazer algo especial mas não sabe nem por onde começar",
    "Tem pouco tempo (ou nenhum) pra planejar",
    "Quer parecer que pensou em cada detalhe — mesmo sem ser bom nisso",
  ],
  notForYou: [
    "Você já é a pessoa criativa que adora planejar surpresas do zero",
    "Você quer um produto físico (esse é 100% digital)",
    "Tem mais de 30 dias pra planejar e prefere fazer tudo na unha",
  ],
} as const;

export const testimonials = {
  title: 'Milhares de pessoas que pensaram "será que vai funcionar?" — e descobriram que sim.',
  items: [
    {
      text: "cara eu sou pessimo nessas coisas. achei que ia parecer forçado mas ela CHOROU quando viu a mesa kkk ja to pensando em usar de novo no aniversario dela",
      name: "Rafael, 34",
      context: "usou em casa",
    },
    {
      text: "Fiz tudo em 1h. Achei que ia ser furada de R$10 mas as frases prontas salvaram demais — eu nunca saberia o que escrever sozinha. Ele ficou meio sem reação quando leu o bilhete. Coisa que eu nunca consegui fazer ele sentir.",
      name: "Marina, 28",
      context: "surpresa pro namorado",
    },
    {
      text: "Gastei R$73 no mercado e ficou lindo. Mil vezes melhor q ir naquele mesmo restaurante caro de sempre, sério. Ela ficou postando foto do bilhete que escrevi pra amiga dela durante a semana inteira",
      name: "Bia, 31",
      context: "primeiro Dia dos Namorados juntos",
    },
    {
      text: "comprei meio na duvida pq R$19 parecia barato dms. mas vei, ela ficou impressionada. tipo de coisa q faz tempo q eu nao fazia ela sentir. valeu cada centavo",
      name: "Diego, 39",
      context: "deixou pra última hora",
    },
  ],
} as const;

export const whyCheap = {
  title: '"Mas por que é tão barato?"',
  paragraphs: [
    'A pergunta certa não é "por que é barato". É: por que tantos relacionamentos morrem por causa de R$19,90?',
    "A maioria das pessoas não faz nada de especial porque não sabe o que fazer — não porque não quer. O Método Surpresa Perfeita™ existe pra resolver isso por um preço que ninguém tem desculpa pra não pagar.",
    "É 100% digital. Sem impressão, sem frete, sem estoque. A gente cobre o custo de criar e mantém o preço baixo porque vende pra muita gente. Se fosse um livro em livraria, custaria R$60. Aqui custa R$19,90 — e você refaz o quiz quantas vezes quiser.",
  ],
} as const;

export const pricing = {
  title: "Escolha o seu plano",
  promoBefore:
    "Promoção de pré-Dia dos Namorados. Esse preço vale até 31/05. A partir de 01/06, com a proximidade da data, o valor volta pro preço cheio (R$39,90).",
  promoAfter: "Preço promocional encerrado. O Premium está disponível por R$39,90.",
  basicTagline: "Pra quem quer o essencial e montar o resto com o que o plano já entrega.",
  premiumTagline: "A experiência completa. Pra você ter zero margem de erro nessa noite.",
  anchor:
    "Um jantar de Dia dos Namorados em restaurante custa fácil R$300 pra dois — e termina igual ao do ano passado. Aqui você gasta R$19,90, cria uma noite que ela vai lembrar pra sempre, e ainda refaz o quiz no aniversário, no mêsversário, sem motivo nenhum.",
  trustLine: "Acesso imediato · Acesso vitalício · Garantia de 7 dias",
} as const;

export const faqItems = [
  {
    q: "Mas eu sou MESMO ruim nessas coisas. Vai funcionar pra mim?",
    a: "Sim. Esse método foi feito exatamente pra quem se considera ruim em surpresa. Não tem nada que dependa da sua criatividade. Tem decisão pronta, roteiro pronto, palavras prontas. Você só executa o que está escrito.",
  },
  {
    q: "E se eu pagar e não gostar?",
    a: "Você tem 7 dias de garantia. Não gostou, devolvemos o dinheiro sem pergunta.",
  },
  {
    q: "Preciso responder um quiz antes de comprar?",
    a: "Não. Você compra direto, recebe acesso imediato, e dentro do site tem um quiz rápido de poucos cliques pra personalizar. Sem fricção, sem espera.",
  },
  {
    q: "Esse método é realmente personalizado ou é o mesmo plano pra todo mundo?",
    a: "Cada combinação de respostas do quiz gera um plano diferente. Dois clientes com respostas diferentes recebem planos completamente diferentes.",
  },
  {
    q: "Vai funcionar mesmo se eu deixei pra última hora?",
    a: "Sim. O Premium inclui um plano emergência de 1 hora pensado exatamente pra isso. Já teve cliente comprando às 17h e surpreendendo às 20h.",
  },
  {
    q: "Eu preciso saber cozinhar?",
    a: "Não. As ideias de jantar incluem opções simples — você escolhe o que cabe no seu tempo e habilidade.",
  },
  {
    q: "Posso refazer o quiz?",
    a: "Pode quantas vezes quiser. Cada vez que muda as respostas, gera um plano novo. Compra uma vez, usa o ano inteiro.",
  },
  {
    q: "Funciona pra casal LGBT+?",
    a: "Funciona. O quiz pergunta sobre o casal sem suposições — o plano é montado pra vocês.",
  },
  {
    q: "Recebo um produto físico?",
    a: "Não — é 100% digital. Justamente por isso é tão barato.",
  },
] as const;

export const finalCta = {
  title: "No dia 13 de junho, você vai estar em um de dois lugares.",
  paragraphs: [
    'Ou vai acordar do lado dela(e) com aquela sensação rara de ter acertado em cheio. Vai pegar o celular e ver as fotos da noite. Talvez ela(e) já tenha postado alguma coisa. E você vai pensar: "fiz bonito."',
    'Ou vai acordar do lado dela(e) depois de mais um Dia dos Namorados igual aos outros. Sem foto pra guardar. Sem história pra contar. E vai pensar: "ano que vem eu me organizo."',
    "Você já pensou isso ano passado.",
    "E no anterior.",
    "Por R$19,90 e 3 minutos do seu tempo, você decide em qual dos dois lados vai acordar.",
  ],
  cta: "Esse ano eu não passo em branco",
  microcopy: "Acesso imediato · Garantia de 7 dias · A partir de R$10",
} as const;

export const footer = {
  brand: BRAND_NAME,
  tagline: "Feito com ❤️",
} as const;
