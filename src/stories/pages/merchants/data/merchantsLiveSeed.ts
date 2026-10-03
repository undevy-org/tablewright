import type { LiveMerchantBalanceType, LiveMerchantTrafficType, RawLiveMerchant } from "../types";

// Deterministic replacement for a live-system dump: 366 records, 352 distinct
// merchant names (some in hostname form), base62 internal ids, microsecond
// timestamps, and a production-shaped status skew. None of that is copyable,
// so this generates data with the same shape and marginal statistics instead
// -- every name, id and timestamp below is synthesized, none are real.
//
// Deterministic means seeded: SEED is fixed, so the same RECORD_COUNT always
// produces the same output and a story's appearance does not drift between
// builds. Bump SEED (not the algorithm) to get a different-looking dataset.

const SEED = 366_20260305;
const RECORD_COUNT = 366;

// --- seeded PRNG -----------------------------------------------------------

function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rand = () => number;

function randInt(rand: Rand, minInclusive: number, maxInclusive: number): number {
  return minInclusive + Math.floor(rand() * (maxInclusive - minInclusive + 1));
}

function pick<T>(rand: Rand, items: readonly T[]): T {
  return items[randInt(rand, 0, items.length - 1)];
}

/** Fisher-Yates shuffle, seeded. */
function shuffle<T>(rand: Rand, items: T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rand, 0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Builds an array of `total` labels with an exact count per label (not a
 * probabilistic draw), then shuffles it -- so the generated data hits the
 * measured marginal frequency exactly while looking randomly ordered.
 */
function exactCountAssignment<T>(rand: Rand, total: number, counts: [T, number][]): T[] {
  const out: T[] = [];
  for (const [label, count] of counts) {
    for (let i = 0; i < count; i++) out.push(label);
  }
  if (out.length !== total) {
    throw new Error(`exactCountAssignment: counts sum to ${out.length}, expected ${total}`);
  }
  return shuffle(rand, out);
}

const BASE62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function randomId(rand: Rand, length = 22): string {
  let s = "";
  for (let i = 0; i < length; i++) s += BASE62[randInt(rand, 0, BASE62.length - 1)];
  return s;
}

// --- timestamps --------------------------------------------------------

// Matches the measured range of the original dump (2023-11-17 .. 2026-03-05).
const RANGE_START_MS = Date.parse("2023-11-17T00:00:00.000Z");
const RANGE_END_MS = Date.parse("2026-03-05T23:59:59.000Z");
const MAX_UPDATE_DELTA_MS = 1000 * 60 * 60 * 24 * 120; // up to ~120 days after creation

/** ISO-8601 UTC with 6 fractional digits, matching the dump's microsecond precision. */
function toMicrosecondIso(epochMs: number, rand: Rand): string {
  const base = new Date(epochMs).toISOString(); // ...SSSZ (millisecond precision)
  const extraDigits = String(randInt(rand, 0, 999)).padStart(3, "0");
  return base.replace("Z", `${extraDigits}Z`);
}

function randomEpochMs(rand: Rand, minMs: number, maxMs: number): number {
  return minMs + Math.floor(rand() * (maxMs - minMs));
}

// --- names ---------------------------------------------------------------

const NAME_PREFIXES = [
  "Nova",
  "Bright",
  "Northgate",
  "Meridian",
  "Vertex",
  "Solace",
  "Anchorpoint",
  "Coral",
  "Ferrovia",
  "Beacon",
  "Lumen",
  "Halcyon",
  "Driftwood",
  "Ferncrest",
  "Ironvale",
  "Wagerpeak",
  "Playcrest",
  "Reelforge",
  "Northlight",
  "Cascade",
  "Amberline",
  "Cobalt",
  "Everline",
  "Fairmont",
];

const NAME_SUFFIXES = [
  "Trade",
  "Exchange",
  "Merchants",
  "Solutions",
  "Partners",
  "Holdings",
  "Group",
  "Ventures",
  "Gaming",
  "Bet",
  "Wallet",
  "Pay",
  "Studio",
  "Labs",
  "Digital",
  "Global",
  "Capital",
  "Network",
  "Systems",
  "Works",
];

const HOSTNAME_TLDS = ["io", "app", "pro", "biz", "xyz", "co"];

function randomCompanyName(rand: Rand, hostnameForm: boolean): string {
  const prefix = pick(rand, NAME_PREFIXES);
  const suffix = pick(rand, NAME_SUFFIXES);
  if (hostnameForm) {
    return `${prefix.toLowerCase()}${suffix.toLowerCase()}.${pick(rand, HOSTNAME_TLDS)}`;
  }
  // Occasionally a single word, occasionally two -- matches the mixed
  // one-word/two-word shape seen in the dump's own examples.
  return randInt(rand, 0, 2) === 0 ? prefix : `${prefix} ${suffix}`;
}

function generateNames(rand: Rand, count: number, uniqueTarget: number): string[] {
  const pool = new Set<string>();
  // ~24/366 of the dump's names were hostname-shaped; keep the same ratio.
  const hostnameCount = Math.round((24 / 366) * uniqueTarget);
  while (pool.size < uniqueTarget) {
    const hostnameForm = pool.size < hostnameCount;
    const name = randomCompanyName(rand, hostnameForm);
    if (!pool.has(name)) pool.add(name);
  }
  const uniqueNames = shuffle(rand, [...pool]);
  const names = uniqueNames.slice(0, count);
  // Pad to `count` by repeating already-used names, matching the dump's
  // measured ~14 duplicate names among 366 records.
  while (names.length < count) {
    names.push(pick(rand, uniqueNames));
  }
  return shuffle(rand, names);
}

// --- generator -------------------------------------------------------------

function generateMerchants(seed: number, count: number): RawLiveMerchant[] {
  const rand = mulberry32(seed);

  // Measured marginal frequencies (out of 366) from the source dump.
  const scale = count / 366;
  const scaled = (n: number) => Math.max(0, Math.round(n * scale));

  const statuses = exactCountAssignment(rand, count, [
    ["ACTIVE" as const, scaled(23)],
    ["BLOCKED" as const, scaled(338)],
    ["DELETED" as const, count - scaled(23) - scaled(338)],
  ]);
  const trafficTypes: LiveMerchantTrafficType[] = exactCountAssignment(rand, count, [
    ["TRAFFIC_LOW_RISK", scaled(339)],
    ["TRAFFIC_HIGH_RISK", scaled(12)],
    ["TRAFFIC_MEDIUM_RISK", count - scaled(339) - scaled(12)],
  ]);
  const balanceTypes: LiveMerchantBalanceType[] = exactCountAssignment(rand, count, [
    ["BALANCE_CRYPTO", scaled(338)],
    ["BALANCE_FIAT", scaled(11)],
    ["BALANCE_CRYPTO_DEPOSIT", scaled(9)],
    ["BALANCE_FIAT_DEPOSIT", count - scaled(338) - scaled(11) - scaled(9)],
  ]);
  const mfaRequired = exactCountAssignment(rand, count, [
    [false, count - scaled(24)],
    [true, scaled(24)],
  ]);
  // 6/366 of spam_block_expiration values are a real timestamp; the rest are
  // the dump's "N/A" sentinel.
  const spamBlockSet = exactCountAssignment(rand, count, [
    [true, scaled(6)],
    [false, count - scaled(6)],
  ]);

  const names = generateNames(rand, count, Math.min(count, scaled(352)));
  const ids = new Set<string>();
  while (ids.size < count) ids.add(randomId(rand));
  const idList = [...ids];

  const records: RawLiveMerchant[] = [];
  for (let i = 0; i < count; i++) {
    const status = statuses[i];
    const createdMs = randomEpochMs(rand, RANGE_START_MS, RANGE_END_MS - MAX_UPDATE_DELTA_MS);
    const updatedMs = Math.min(
      RANGE_END_MS,
      createdMs + Math.floor(rand() * MAX_UPDATE_DELTA_MS),
    );
    const createdAt = toMicrosecondIso(createdMs, rand);
    const updatedAt = toMicrosecondIso(updatedMs, rand);

    let deletedAt: string | null = null;
    if (status === "DELETED") {
      const deletedMs = Math.min(RANGE_END_MS, updatedMs + Math.floor(rand() * MAX_UPDATE_DELTA_MS));
      deletedAt = toMicrosecondIso(deletedMs, rand);
    }

    const spamBlockExpiration = spamBlockSet[i]
      ? toMicrosecondIso(randomEpochMs(rand, RANGE_START_MS, RANGE_END_MS), rand)
      : "N/A";

    records.push({
      id: idList[i],
      name: names[i],
      role: "MERCHANT",
      status,
      mfa_required: mfaRequired[i],
      traffic_type: trafficTypes[i],
      balance_type: balanceTypes[i],
      spam_block_expiration: spamBlockExpiration,
      created_at: createdAt,
      updated_at: updatedAt,
      deleted_at: deletedAt,
    });
  }
  return records;
}

export const rawMerchantsLiveSeed: RawLiveMerchant[] = generateMerchants(SEED, RECORD_COUNT);
