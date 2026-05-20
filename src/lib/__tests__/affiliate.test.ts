import { describe, expect, it } from "vitest";
import {
  buildExternalReferenceParts,
  calculateCommissionCents,
  isSelfReferral,
  isValidAffiliateCodeFormat,
  parseAffiliateCodeFromExternalReference,
  parseUserIdFromReferenceParts,
} from "@/lib/affiliate-reference";

describe("affiliate-reference", () => {
  it("valida formato de código", () => {
    expect(isValidAffiliateCodeFormat("JOAO10")).toBe(true);
    expect(isValidAffiliateCodeFormat("ab")).toBe(false);
  });

  it("round-trip affiliate + user na referência", () => {
    const ref = buildExternalReferenceParts({
      affiliateCode: "JOAO10",
      userId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      suffix: "surprise-premium-abc",
    });
    expect(parseAffiliateCodeFromExternalReference(ref)).toBe("JOAO10");
    expect(parseUserIdFromReferenceParts(ref)).toBe("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
  });

  it("calcula comissão", () => {
    expect(calculateCommissionCents(10000, 0.3)).toBe(3000);
  });

  it("detecta auto-referral", () => {
    expect(isSelfReferral("joao@test.com", "Joao@Test.com")).toBe(true);
    expect(isSelfReferral("joao@test.com", "outro@test.com")).toBe(false);
  });
});
