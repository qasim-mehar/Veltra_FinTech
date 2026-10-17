/**
 * Veltra paisa money library — the single owner of all money conversion.
 *
 * Rules:
 * - Every money value in the system is an integer number of paisa, carried as BigInt.
 *   Rs. 1,200 = 120000n. Rs. 1.50 = 150n. Floats on money are forbidden anywhere.
 * - Rates are integer basis points (bps): 1% = 100 bps, 1.5% = 150 bps, 10% = 1000 bps.
 * - All proportional math rounds half-up, in integer math:
 *     quotient = (value * bps + 5000) / 10000, computed with BigInt division.
 * - BigInt never crosses a JSON boundary raw. bigintToJSON is the only edge;
 *   every API serialiser in this codebase converts through it.
 */

/** Instant referral bonus for the referrer when a referee's first deposit is approved: 10%. */
export const REFERRAL_BONUS_BPS = 1000;

/** Daily commission on each referee's daily profit for the referrer: 1.5%. */
export const REFERRAL_DAILY_BPS = 150;

/** Formats integer paisa as a Pakistani rupee string, "Rs." prefix, comma thousands.
 *
 *  - Whole rupee amounts render with no decimals: 120000n → "Rs. 1,200", 0n → "Rs. 0".
 *  - Fractional amounts render with exactly 2 decimals: 150n → "Rs. 1.50".
 *  - Negative amounts render with a leading "-", before "Rs.": -2050n → "-Rs. 20.50".
 */
export function formatPaisa(paisa: bigint): string {
  if (paisa < 0n) {
    return `-${formatPaisa(-paisa)}`;
  }
  const rupees = paisa / 100n;
  const paise = paisa % 100n;
  const rupeesInt = rupees.toString();
  // Deterministic comma grouping (no locale dependence).
  const rupeesWithCommas = rupeesInt.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (paise === 0n) {
    return `Rs. ${rupeesWithCommas}`;
  }
  const paiseTwoDigits = paise.toString().padStart(2, "0");
  return `Rs. ${rupeesWithCommas}.${paiseTwoDigits}`;
}

/** Parses a user-entered rupee amount into integer paisa.
 *
 *  Accepts: "1200", "1,200", "Rs. 1,200.50", "1200.5". Returns paisa: 120000n, 120000n,
 *  120050n, 120050n. A comma-masked input must be grouped in threes after a one- to
 *  three-digit leading group ("1,200.50" ok, "1,20" rejected). At most 2 decimal places.
 *  Throws on anything else: empty strings, letters, negatives, >2 decimals.
 */
export function parsePaisa(input: string): bigint {
  if (!input || typeof input !== "string") {
    throw new Error(`Cannot parse rupees to paisa from ${JSON.stringify(input)}.`);
  }

  let text = input.trim();
  // Case-insensitive "Rs." / "rs." / "RS." prefix with an optional space.
  text = text.replace(/^rs\.?\s*/i, "");
  text = text.trim();
  if (text.includes("-") || text.includes("+")) {
    throw new Error(`Cannot parse rupees to paisa from ${JSON.stringify(input)}: negatives are not accepted.`);
  }

  // Whole-pairs pattern, and comma-grouped pattern (groups of exactly three, at least two digits).
  const plain = /^(\d+)(?:\.(\d{1,2}))?$/;
  const grouped = /^(\d{1,3}(?:,\d{3})+)(?:\.(\d{1,2}))?$/;

  const match = text.match(plain) ?? (text.includes(",") ? text.match(grouped) : null);
  if (!match) {
    throw new Error(`Cannot parse rupees to paisa from ${JSON.stringify(input)}.`);
  }

  const wholeRupeesDigits = (match[1] ?? "").replace(/,/g, "");
  const fractionalDigits = match[2] ?? "";
  const rupees = BigInt(wholeRupeesDigits);
  const paisaPortion = fractionalDigits.length === 0
    ? 0n
    : BigInt(fractionalDigits) * BigInt(10 ** (2 - fractionalDigits.length));
  return rupees * 100n + paisaPortion;
}

/** Renders a basis-point rate as a human percent string: 150 → "1.5%", 100 → "1%", 125 → "1.25%". */
export function bpsToPercentString(bps: number): string {
  if (!Number.isInteger(bps) || bps < 0) {
    throw new Error(`bps must be a non-negative integer, got ${JSON.stringify(bps)}.`);
  }
  const whole = Math.floor(bps / 100);
  const hundredths = bps % 100;
  if (hundredths === 0) {
    return `${whole}%`;
  }
  const fractional = hundredths.toString().padStart(2, "0").replace(/0+$/, "");
  return `${whole}.${fractional}%`;
}

/** Integer half-up rounding of a product of paisa and a bps rate to paisa:
 *  (value * bps + 5000) / 10000 in BigInt arithmetic. Inputs must not be negative.
 */
function scaleAmountHalfUp(value: bigint, bps: number): bigint {
  if (value < 0n) {
    throw new Error("Negative paisa is not allowed in bps math.");
  }
  if (!Number.isInteger(bps) || bps < 0) {
    throw new Error(`bps must be a non-negative integer, got ${JSON.stringify(bps)}.`);
  }
  return (value * BigInt(bps) + 5000n) / 10000n;
}

/** One day of profit for an investment: plan price × daily rate, half-up in integer paisa.
 *  Example: calcProfitPaisa(160000n, 125) → 2000n (Rs. 20).
 */
export function calcProfitPaisa(pricePaisa: bigint, rateBps: number): bigint {
  return scaleAmountHalfUp(pricePaisa, rateBps);
}

/** Referrer's daily commission on a referee's credited daily profit. 1.5% by default.
 *  Example: calcCommissionPaisa(10000n) → 150n (Rs. 1.50).
 */
export function calcCommissionPaisa(profitPaisa: bigint, bps: number = REFERRAL_DAILY_BPS): bigint {
  return scaleAmountHalfUp(profitPaisa, bps);
}

/** Referrer's instant bonus when a referee's deposit is approved: 10% of the deposit.
 *  Example: calcReferralBonusPaisa(160000n) → 16000n (Rs. 160).
 */
export function calcReferralBonusPaisa(depositPaisa: bigint): bigint {
  return scaleAmountHalfUp(depositPaisa, REFERRAL_BONUS_BPS);
}

/** Converts paisa to a plain Number for JSON transport. BigInt must never cross a
 *  JSON boundary raw, and the JSON-safe domain ends at Number.MAX_SAFE_INTEGER;
 *  anything beyond throws rather than silently losing paisa.
 */
export function bigintToJSON(paisa: bigint): number {
  const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);
  if (paisa > maxSafe || paisa < -maxSafe) {
    throw new Error(
      `Cannot serialise paisa to JSON: ${paisa} exceeds the Number.MAX_SAFE_INTEGER budget.`
    );
  }
  return Number(paisa);
}
