import { describe, expect, it } from "vitest";
import { isLetterUnlockable } from "@/components/letters/LetterEnvelope";
import type { Letter } from "@/lib/types";

const base: Letter = {
  id: "1",
  title: "Test",
  message: "Hi",
  createdAt: new Date().toISOString(),
  sealed: false,
};

describe("isLetterUnlockable", () => {
  it("allows open when not sealed", () => {
    expect(isLetterUnlockable(base)).toBe(true);
  });

  it("blocks sealed letter without unlock date", () => {
    expect(isLetterUnlockable({ ...base, sealed: true })).toBe(false);
  });

  it("allows sealed letter after unlock date", () => {
    expect(
      isLetterUnlockable(
        { ...base, sealed: true, unlockDate: "2020-01-01" },
        new Date("2025-01-01"),
      ),
    ).toBe(true);
  });
});
