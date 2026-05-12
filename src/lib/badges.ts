import type { Memory, BucketItem, Couple } from "./types";
import { daysTogether } from "./dates";

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: { current: number; target: number };
}

export function computeBadges(
  couple: Couple | null,
  memories: Memory[],
  bucket: BucketItem[],
): Badge[] {
  const totalPhotos = memories.reduce((s, m) => s + m.photos.length, 0);
  const days = couple ? daysTogether(couple.startDate) : 0;
  const hasTravel = memories.some((m) => m.emotion === "travel");
  const bucketDone = bucket.filter((b) => b.done).length;

  return [
    {
      id: "first-memory",
      title: "Primeira memória",
      description: "Você criou sua primeira memória",
      icon: "⭐",
      unlocked: memories.length >= 1,
      progress: { current: Math.min(memories.length, 1), target: 1 },
    },
    {
      id: "ten-memories",
      title: "10 memórias",
      description: "Já são 10 momentos guardados",
      icon: "💯",
      unlocked: memories.length >= 10,
      progress: { current: Math.min(memories.length, 10), target: 10 },
    },
    {
      id: "fifty-memories",
      title: "50 memórias",
      description: "Uma coleção e tanto!",
      icon: "🌟",
      unlocked: memories.length >= 50,
      progress: { current: Math.min(memories.length, 50), target: 50 },
    },
    {
      id: "hundred-days",
      title: "100 dias juntos",
      description: "Os primeiros 100 dias dessa história",
      icon: "🎊",
      unlocked: days >= 100,
      progress: { current: Math.min(days, 100), target: 100 },
    },
    {
      id: "first-trip",
      title: "Primeira viagem",
      description: "Vocês registraram uma viagem juntos",
      icon: "✈️",
      unlocked: hasTravel,
    },
    {
      id: "one-year",
      title: "1 ano juntos",
      description: "Um ano dessa história linda 💕",
      icon: "💕",
      unlocked: days >= 365,
      progress: { current: Math.min(days, 365), target: 365 },
    },
    {
      id: "hundred-photos",
      title: "100 fotos guardadas",
      description: "Uma galeria cheia de lembranças",
      icon: "📸",
      unlocked: totalPhotos >= 100,
      progress: { current: Math.min(totalPhotos, 100), target: 100 },
    },
    {
      id: "bucket-five",
      title: "5 sonhos realizados",
      description: "Cinco itens do bucket list cumpridos",
      icon: "🏆",
      unlocked: bucketDone >= 5,
      progress: { current: Math.min(bucketDone, 5), target: 5 },
    },
  ];
}
