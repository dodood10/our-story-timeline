import { useLocalStorage } from "./useLocalStorage";

export type SurpriseTier = "none" | "basic" | "premium";

const KEY_SURPRISE = "ml.access.surprise";
const KEY_FULL = "ml.access.full";

/** Mocked access control. Replace with real auth/checkout later. */
export function useAccess() {
  const [surprise, setSurprise, hSurprise] = useLocalStorage<SurpriseTier>(KEY_SURPRISE, "none");
  const [full, setFull, hFull] = useLocalStorage<boolean>(KEY_FULL, false);
  const hydrated = hSurprise && hFull;

  return {
    surprise,
    setSurprise,
    full,
    setFull,
    hydrated,
    hasSurprise: surprise === "basic" || surprise === "premium",
    isPremium: surprise === "premium",
    reset: () => {
      setSurprise("none");
      setFull(false);
    },
  };
}
