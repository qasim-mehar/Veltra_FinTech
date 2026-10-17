import { describe, expect, it } from "vitest";
import {
  REFERRAL_BONUS_BPS,
  REFERRAL_DAILY_BPS,
  bigintToJSON,
  bpsToPercentString,
  calcCommissionPaisa,
  calcProfitPaisa,
  calcReferralBonusPaisa,
  formatPaisa,
  parsePaisa,
} from "../src/lib/db/money";

describe("worked examples (frozen contract)", () => {
  it("formatPaisa(120000n) → Rs. 1,200", () => {
    expect(formatPaisa(120000n)).toBe("Rs. 1,200");
  });

  it("formatPaisa(150n) → Rs. 1.50", () => {
    expect(formatPaisa(150n)).toBe("Rs. 1.50");
  });

  it("formatPaisa(0n) → Rs. 0", () => {
    expect(formatPaisa(0n)).toBe("Rs. 0");
  });

  it("calcProfitPaisa(160000n, 125) → 2000n (Rs. 20)", () => {
    expect(calcProfitPaisa(160000n, 125)).toBe(2000n);
  });

  it("calcReferralBonusPaisa(160000n) → 16000n (exactly 10%)", () => {
    expect(calcReferralBonusPaisa(160000n)).toBe(16000n);
  });

  it("calcCommissionPaisa(10000n) → 150n (exactly 1.5%)", () => {
    expect(calcCommissionPaisa(10000n)).toBe(150n);
  });

  it("parsePaisa('1,200.50') → 120050n", () => {
    expect(parsePaisa("1,200.50")).toBe(120050n);
  });
});

describe("rate constants", () => {
  it("instant referral bonus is 1000 bps (10%)", () => {
    expect(REFERRAL_BONUS_BPS).toBe(1000);
  });

  it("daily referral commission is 150 bps (1.5%)", () => {
    expect(REFERRAL_DAILY_BPS).toBe(150);
  });
});

describe("parsePaisa", () => {
  it("accepts plain rupees", () => {
    expect(parsePaisa("1200")).toBe(120000n);
  });

  it("accepts comma-grouped rupees", () => {
    expect(parsePaisa("1,200")).toBe(120000n);
  });

  it("accepts an Rs. prefix", () => {
    expect(parsePaisa("Rs. 1,200.50")).toBe(120050n);
  });

  it("accepts a single fractional digit", () => {
    expect(parsePaisa("1200.5")).toBe(120050n);
  });

  it("rejects an empty string", () => {
    expect(() => parsePaisa("")).toThrow();
  });

  it("rejects letters", () => {
    expect(() => parsePaisa("abc")).toThrow();
  });

  it("rejects three decimal places", () => {
    expect(() => parsePaisa("1.234")).toThrow();
  });

  it("rejects negative values", () => {
    expect(() => parsePaisa("-5")).toThrow();
  });
});

describe("formatPaisa", () => {
  it("renders sub-rupee amounts with 2 decimals", () => {
    expect(formatPaisa(999n)).toBe("Rs. 9.99");
  });

  it("groups millions with commas", () => {
    expect(formatPaisa(100000000n)).toBe("Rs. 1,000,000");
  });

  it("renders negatives with a leading minus before Rs.", () => {
    expect(formatPaisa(-2050n)).toBe("-Rs. 20.50");
  });

  it("renders whole-rupee amounts without decimals", () => {
    expect(formatPaisa(100n)).toBe("Rs. 1");
  });
});

describe("bps math rounds half-up in integer arithmetic", () => {
  it("rounds an exact .5 remainder up (1250 * bps case)", () => {
    // 1000n * 125 bps = 125000n / 10000n = 12.5 raw → half-up → 13n.
    expect(calcProfitPaisa(1000n, 125)).toBe(13n);
  });

  it("truncates an exact integer product without spuriously rounding up", () => {
    // 160000n * 125 bps = 2000 exactly; the +5000 bias must not push it to 2001n.
    expect(calcProfitPaisa(160000n, 125)).toBe(2000n);
  });

  it("calcCommissionPaisa uses the 1.5% default", () => {
    expect(calcCommissionPaisa(10000n)).toBe(150n);
  });

  it("calcCommissionPaisa accepts an explicit bps override", () => {
    // 10000n * 300 bps = Rs. 30.
    expect(calcCommissionPaisa(10000n, 300)).toBe(300n);
  });

  it("calcReferralBonusPaisa is exactly 10% of a deposit", () => {
    expect(calcReferralBonusPaisa(120000n)).toBe(12000n);
    expect(calcReferralBonusPaisa(400000n)).toBe(40000n);
  });
});

describe("bpsToPercentString", () => {
  it("renders 150 bps as 1.5%", () => {
    expect(bpsToPercentString(150)).toBe("1.5%");
  });

  it("renders 100 bps as 1%", () => {
    expect(bpsToPercentString(100)).toBe("1%");
  });

  it("renders 125 bps as 1.25%", () => {
    expect(bpsToPercentString(125)).toBe("1.25%");
  });

  it("renders 1000 bps as 10%", () => {
    expect(bpsToPercentString(1000)).toBe("10%");
  });
});

describe("bigintToJSON", () => {
  it("converts within the JSON-safe budget", () => {
    expect(bigintToJSON(120000n)).toBe(120000);
    expect(bigintToJSON(0n)).toBe(0);
  });

  it("throws beyond Number.MAX_SAFE_INTEGER", () => {
    expect(() => bigintToJSON(9007199254740992n)).toThrow();
  });
});
