import type { GiftIdea, GiftQuizAnswers } from "./types";

export const HOBBIES = [
  "Leitura",
  "Música",
  "Cinema",
  "Esportes",
  "Cozinhar",
  "Viagem",
  "Arte",
  "Tecnologia",
  "Jogos",
  "Jardinagem",
] as const;

/** Union of all valid hobby strings derived from the HOBBIES constant. */
export type Hobby = (typeof HOBBIES)[number];

export const GIFT_IDEAS: GiftIdea[] = [
  { id: "g1", name: "Caixa de cartas escritas à mão", why: "Cada palavra fica eternizada — algo para reler em dias difíceis.", category: "classic", budget: "low", hobbies: ["Leitura"] },
  { id: "g2", name: "Vinil da música de vocês", why: "Transforma a trilha sonora do casal em um objeto físico colecionável.", category: "classic", budget: "mid", hobbies: ["Música"] },
  { id: "g3", name: "Sessão de fotos profissional", why: "Cria memórias visuais para emoldurar e olhar daqui a 20 anos.", category: "modern", budget: "mid", hobbies: ["Arte", "Viagem"] },
  { id: "g4", name: "Final de semana surpresa", why: "Uma viagem curta inesperada cria histórias para o resto da vida.", category: "adventurous", budget: "high", hobbies: ["Viagem", "Aventura"] },
  { id: "g5", name: "Aula de culinária a dois", why: "Aprender e criar algo juntos é uma experiência inesquecível.", category: "modern", budget: "mid", hobbies: ["Cozinhar"] },
  { id: "g6", name: "Livro com dedicatória personalizada", why: "Aposta certeira para quem ama ler — afeto + cultura.", category: "classic", budget: "low", hobbies: ["Leitura"] },
  { id: "g7", name: "Ingressos para um show especial", why: "Compartilhar a energia de um show ao vivo é puro vínculo.", category: "modern", budget: "mid", hobbies: ["Música"] },
  { id: "g8", name: "Maratona temática em casa", why: "Filmes favoritos + comida favorita + cobertor = perfeito.", category: "classic", budget: "low", hobbies: ["Cinema"] },
  { id: "g9", name: "Voo de balão ou paraquedas", why: "Adrenalina compartilhada vira a história favorita do casal.", category: "adventurous", budget: "high", hobbies: ["Aventura"] },
  { id: "g10", name: "Kit de plantas para começar uma horta", why: "Cuidar de algo vivo juntos é metáfora linda do relacionamento.", category: "modern", budget: "low", hobbies: ["Jardinagem"] },
  { id: "g11", name: "Console ou jogo cooperativo", why: "Horas de diversão lado a lado, time imbatível.", category: "modern", budget: "high", hobbies: ["Jogos", "Tecnologia"] },
  { id: "g12", name: "Mapa raspável de viagens", why: "Cada destino visitado vira um ritual de raspar juntos.", category: "adventurous", budget: "low", hobbies: ["Viagem"] },
  { id: "g13", name: "Quadro com letra de música", why: "Um trecho que diz tudo, emoldurado para olhar todo dia.", category: "classic", budget: "low", hobbies: ["Música", "Arte"] },
  { id: "g14", name: "Day-spa para dois", why: "Pausa absoluta do mundo, só vocês dois relaxando.", category: "classic", budget: "high", hobbies: [] },
  { id: "g15", name: "Curso a dois (cerâmica, dança, fotografia)", why: "Aprender uma habilidade nova vira hobby compartilhado.", category: "modern", budget: "mid", hobbies: ["Arte"] },
  { id: "g16", name: "Trilha + piquenique surpresa", why: "Natureza, comida boa e ninguém ao redor — clássico.", category: "adventurous", budget: "low", hobbies: ["Esportes", "Aventura"] },
];

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickGifts(answers: GiftQuizAnswers, count = 6): GiftIdea[] {
  const scored = shuffle(GIFT_IDEAS.map((g) => {
    let score = 0;
    if (g.category === answers.style) score += 3;
    if (g.budget === answers.budget) score += 2;
    if (g.hobbies.includes(answers.hobby)) score += 4;
    return { g, score };
  }));
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.g);
}
