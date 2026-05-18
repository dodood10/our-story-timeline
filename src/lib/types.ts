export type RelationshipStatus = "dating" | "engaged" | "married";

export interface Couple {
  name1: string;
  name2: string;
  photo?: string;
  startDate: string;
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

/** GPS coordinate pair [latitude, longitude]. */
export type Coords = [number, number];

export interface Memory {
  id: string;
  title: string;
  date: string;
  description: string;
  /** Each entry is either a data URL or an "idb:KEY" reference. */
  photos: string[];
  emotion: Emotion;
  location?: string;
  /** Optional GPS coordinates for map view. */
  coords?: Coords;
  /** Free-form tags chosen by the couple. */
  tags?: string[];
  favorite?: boolean;
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
  photo?: string;
  createdAt: string;
}

export interface Letter {
  id: string;
  title: string;
  message: string;
  unlockDate?: string;
  sealed: boolean;
  openedAt?: string;
  createdAt: string;
}

export type Theme = "romantic" | "minimal" | "modern";

export interface Settings {
  theme: Theme;
  notifications: boolean;
  /** Optional sync code; when present, app pushes/pulls to Supabase. */
  syncCode?: string;
}

/** Visual style of a gift idea / quiz answer. */
export type GiftStyle = "classic" | "modern" | "adventurous";

/** Price tier for gift ideas. */
export type GiftBudget = "low" | "mid" | "high";

export type GiftQuizAnswers = {
  hobby: string;
  style: GiftStyle;
  budget: GiftBudget;
};

export type GiftIdea = {
  id: string;
  name: string;
  why: string;
  category: GiftStyle;
  budget: GiftBudget;
  hobbies: string[];
};
