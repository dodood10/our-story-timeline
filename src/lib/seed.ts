import type { Memory, BucketItem, Letter } from "./types";
import { uid } from "./storage";

export function seedMemories(): Memory[] {
  const now = new Date();
  const ago = (d: number) => new Date(now.getTime() - d * 86400000).toISOString().slice(0, 10);
  return [
    {
      id: uid(),
      title: "Nosso primeiro encontro",
      date: ago(120),
      description: "Aquele café que virou conversa que virou caminhada. O resto, vocês sabem 💕",
      photos: [],
      emotion: "love",
      location: "Café da esquina",
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Viagem para a praia",
      date: ago(45),
      description: "Sol, mar e aquele pôr-do-sol que ninguém esquece.",
      photos: [],
      emotion: "travel",
      location: "Praia do Forte",
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Jantar surpresa",
      date: ago(10),
      description: "Velinhas, mesa posta, e aquela música que toca em momentos importantes.",
      photos: [],
      emotion: "dinner",
      location: "Em casa",
      createdAt: new Date().toISOString(),
    },
  ];
}

export function seedBucket(): BucketItem[] {
  return [
    { id: uid(), title: "Conhecer Paris juntos", category: "travel", done: false, createdAt: new Date().toISOString() },
    { id: uid(), title: "Jantar em um restaurante japonês fino", category: "food", done: false, createdAt: new Date().toISOString() },
    { id: uid(), title: "Andar de balão", category: "adventure", done: false, createdAt: new Date().toISOString() },
    { id: uid(), title: "Comprar nossa primeira casa", category: "goal", done: false, createdAt: new Date().toISOString() },
  ];
}

export function seedLetters(): Letter[] {
  return [
    {
      id: uid(),
      title: "Abra quando estiver triste 💙",
      message: "Lembra que você não está sozinho(a). Eu estou aqui, sempre. Respira fundo, eu te amo.",
      sealed: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Abra quando precisar sorrir 😊",
      message: "Lembra daquela vez que rimos por 20 minutos sem motivo? É isso. Eu te amo do jeitinho que você é.",
      sealed: true,
      createdAt: new Date().toISOString(),
    },
  ];
}
