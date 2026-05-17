import { useLocalStorage } from "./useLocalStorage";

export type SurpriseTier = "none" | "basic" | "premium";

const KEY_SURPRISE = "ml.access.surprise";
const KEY_FULL = "ml.access.full";

/** Mocked access control. Replace with real auth/checkout later. */
export function useAccess() {
  const [surprise, setSurprise] = useLocalStorage<SurpriseTier>(KEY_SURPRISE, "none");
  const [full, setFull] = useLocalStorage<boolean>(KEY_FULL, false);

  return {
    surprise,
    setSurprise,
    full,
    setFull,
    hasSurprise: surprise === "basic" || surprise === "premium",
    isPremium: surprise === "premium",
    reset: () => {
      setSurprise("none");
      setFull(false);
    },
  };
}
