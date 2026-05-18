import { describe, expect, it } from "vitest";
import { computeBadges } from "@/lib/badges";
import type { Couple, Memory } from "@/lib/types";

const couple: Couple = {
  name1: "A",
  name2: "B",
  startDate: "2020-01-01",
  status: "dating",
  createdAt: new Date().toISOString(),
};

describe("computeBadges", () => {
  it("unlocks first memory badge", () => {
    const memories: Memory[] = [
      {
        id: "m1",
        title: "Dia 1",
        date: "2024-01-01",
        description: "",
        photos: [],
        emotion: "happy",
        createdAt: new Date().toISOString(),
      },
    ];
    const badges = computeBadges(couple, memories, []);
    expect(badges.find((b) => b.id === "first-memory")?.unlocked).toBe(true);
  });
});
