import { createContext, useContext, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS, uid } from "@/lib/storage";
import type { Couple, Memory, BucketItem, Letter, Settings, Theme } from "@/lib/types";
import { seedBucket, seedLetters, seedMemories } from "@/lib/seed";

interface AppState {
  hydrated: boolean;
  // couple
  couple: Couple | null;
  setCouple: (c: Couple | null) => void;
  // onboarded flag
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  // memories
  memories: Memory[];
  addMemory: (m: Omit<Memory, "id" | "createdAt">) => Memory;
  updateMemory: (id: string, patch: Partial<Memory>) => void;
  deleteMemory: (id: string) => void;
  toggleFavoriteMemory: (id: string) => void;
  // bucket
  bucket: BucketItem[];
  addBucket: (b: Omit<BucketItem, "id" | "createdAt" | "done">) => BucketItem;
  toggleBucket: (id: string, photo?: string) => void;
  deleteBucket: (id: string) => void;
  // letters
  letters: Letter[];
  addLetter: (l: Omit<Letter, "id" | "createdAt" | "sealed" | "openedAt"> & { sealed?: boolean }) => Letter;
  sealLetter: (id: string) => void;
  openLetter: (id: string) => void;
  deleteLetter: (id: string) => void;
  // gift favorites
  giftFavorites: string[];
  toggleGiftFavorite: (id: string) => void;
  // settings
  settings: Settings;
  setTheme: (t: Theme) => void;
  setNotifications: (v: boolean) => void;
  // util
  resetSeed: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [couple, setCouple, h1] = useLocalStorage<Couple | null>(STORAGE_KEYS.couple, null);
  const [onboarded, setOnboarded, h2] = useLocalStorage<boolean>(STORAGE_KEYS.onboarded, false);
  const [memories, setMemories, h3] = useLocalStorage<Memory[]>(STORAGE_KEYS.memories, []);
  const [bucket, setBucket, h4] = useLocalStorage<BucketItem[]>(STORAGE_KEYS.bucket, []);
  const [letters, setLetters, h5] = useLocalStorage<Letter[]>(STORAGE_KEYS.letters, []);
  const [giftFavorites, setGiftFavorites, h6] = useLocalStorage<string[]>(STORAGE_KEYS.giftFavorites, []);
  const [settings, setSettings, h7] = useLocalStorage<Settings>(STORAGE_KEYS.settings, {
    theme: "romantic",
    notifications: false,
  });

  const hydrated = h1 && h2 && h3 && h4 && h5 && h6 && h7;

  // Apply theme class on <html>
  useEffect(() => {
    if (typeof document === "undefined") return;
    const cls = document.documentElement.classList;
    cls.remove("theme-romantic", "theme-minimal", "theme-modern");
    cls.add(`theme-${settings.theme}`);
  }, [settings.theme]);

  const addMemory = useCallback<AppState["addMemory"]>((m) => {
    const created: Memory = { ...m, id: uid(), createdAt: new Date().toISOString() };
    setMemories((prev) => [created, ...prev]);
    return created;
  }, [setMemories]);

  const updateMemory = useCallback<AppState["updateMemory"]>((id, patch) => {
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, [setMemories]);

  const deleteMemory = useCallback((id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }, [setMemories]);

  const toggleFavoriteMemory = useCallback((id: string) => {
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, favorite: !m.favorite } : m)));
  }, [setMemories]);

  const addBucket = useCallback<AppState["addBucket"]>((b) => {
    const created: BucketItem = { ...b, id: uid(), createdAt: new Date().toISOString(), done: false };
    setBucket((prev) => [created, ...prev]);
    return created;
  }, [setBucket]);

  const toggleBucket = useCallback<AppState["toggleBucket"]>((id, photo) => {
    setBucket((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, done: !b.done, doneAt: !b.done ? new Date().toISOString() : undefined, photo: !b.done ? photo ?? b.photo : b.photo }
          : b,
      ),
    );
  }, [setBucket]);

  const deleteBucket = useCallback((id: string) => {
    setBucket((prev) => prev.filter((b) => b.id !== id));
  }, [setBucket]);

  const addLetter = useCallback<AppState["addLetter"]>((l) => {
    const created: Letter = { ...l, id: uid(), createdAt: new Date().toISOString(), sealed: l.sealed ?? false };
    setLetters((prev) => [created, ...prev]);
    return created;
  }, [setLetters]);

  const sealLetter = useCallback((id: string) => {
    setLetters((prev) => prev.map((l) => (l.id === id ? { ...l, sealed: true } : l)));
  }, [setLetters]);

  const openLetter = useCallback((id: string) => {
    setLetters((prev) =>
      prev.map((l) => (l.id === id ? { ...l, openedAt: l.openedAt ?? new Date().toISOString() } : l)),
    );
  }, [setLetters]);

  const deleteLetter = useCallback((id: string) => {
    setLetters((prev) => prev.filter((l) => l.id !== id));
  }, [setLetters]);

  const toggleGiftFavorite = useCallback((id: string) => {
    setGiftFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, [setGiftFavorites]);

  const setTheme = useCallback((t: Theme) => setSettings((s) => ({ ...s, theme: t })), [setSettings]);
  const setNotifications = useCallback((v: boolean) => setSettings((s) => ({ ...s, notifications: v })), [setSettings]);

  const resetSeed = useCallback(() => {
    setMemories(seedMemories());
    setBucket(seedBucket());
    setLetters(seedLetters());
  }, [setMemories, setBucket, setLetters]);

  const value = useMemo<AppState>(
    () => ({
      hydrated,
      couple,
      setCouple,
      onboarded,
      setOnboarded,
      memories,
      addMemory,
      updateMemory,
      deleteMemory,
      bucket,
      addBucket,
      toggleBucket,
      deleteBucket,
      letters,
      addLetter,
      sealLetter,
      openLetter,
      deleteLetter,
      giftFavorites,
      toggleGiftFavorite,
      settings,
      setTheme,
      setNotifications,
      resetSeed,
    }),
    [hydrated, couple, setCouple, onboarded, setOnboarded, memories, addMemory, updateMemory, deleteMemory, bucket, addBucket, toggleBucket, deleteBucket, letters, addLetter, sealLetter, openLetter, deleteLetter, giftFavorites, toggleGiftFavorite, settings, setTheme, setNotifications, resetSeed],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside <AppProvider>");
  return v;
}
