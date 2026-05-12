export type RelationshipStatus = "dating" | "engaged" | "married";

export interface Couple {
  name1: string;
  name2: string;
  photo?: string; // base64
  startDate: string; // ISO
  status: RelationshipStatus;
  createdAt: string;
}

export type Emotion = "happy" | "love" | "funny" | "celebration" | "travel" | "dinner";

export const EMOTIONS: { id: Emotion; emoji: string; label: string }[] = [
  { id: "happy", emoji: "😍", label: "Feliz" },
  { id: "love", emoji: "🥰", label: "Apaixonado" },
  { id: "funny", emoji: "😂", label: "Engraçado" },
  { id: "celebration", emoji: "🎉", label: "Celebração" },
  { id: "travel", emoji: "✈️", label: "Viagem" },
  { id: "dinner", emoji: "🍽️", label: "Jantar" },
];

export interface Memory {
  id: string;
  title: string;
  date: string; // ISO date
  description: string;
  photos: string[]; // base64
  emotion: Emotion;
  location?: string;
  createdAt: string;
}

export type BucketCategory = "travel" | "food" | "adventure" | "goal";

export const BUCKET_CATEGORIES: { id: BucketCategory; emoji: string; label: string }[] = [
  { id: "travel", emoji: "🌍", label: "Viagens" },
  { id: "food", emoji: "🍜", label: "Restaurantes" },
  { id: "adventure", emoji: "🎢", label: "Aventuras" },
  { id: "goal", emoji: "🎯", label: "Metas" },
];

export interface BucketItem {
  id: string;
  title: string;
  category: BucketCategory;
  done: boolean;
  doneAt?: string;
  photo?: string; // base64
  createdAt: string;
}

export interface Letter {
  id: string;
  title: string;
  message: string;
  unlockDate?: string; // ISO; if undefined, condition-only (always openable when sealed)
  sealed: boolean;
  openedAt?: string;
  createdAt: string;
}

export type Theme = "romantic" | "minimal" | "modern";

export interface Settings {
  theme: Theme;
  notifications: boolean;
}

export interface GiftQuizAnswers {
  hobby: string;
  style: "classic" | "modern" | "adventurous";
  budget: "low" | "mid" | "high";
}

export interface GiftIdea {
  id: string;
  name: string;
  why: string;
  category: "classic" | "modern" | "adventurous";
  budget: "low" | "mid" | "high";
  hobbies: string[];
}
