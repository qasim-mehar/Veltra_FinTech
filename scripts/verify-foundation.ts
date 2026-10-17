/**
 * Veltra — Milestone 0 foundation verification.
 *
 * Proves, against the real database:
 *   1. Exactly 4 plans exist with the exact locked paisa prices and placeholder rates.
 *   2. The super admin exists (username printed, never the password).
 *   3. Both default settings exist.
 *   4. The partial unique index deposits_tid_live_unique exists in pg_indexes.
 *   5. Two PENDING deposits with the same SadaPay TID cannot coexist (DB rejects the second).
 *   6. The same TID is accepted again once its one live row is moved to REJECTED.
 *
 * Prints PASS/FAIL per check and exits non-zero if anything failed.
 * Run: npm run verify:foundation
 */
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CheckResult = { ok: boolean; detail: string };

const results: Array<{ name: string; ok: boolean; detail: string }> = [];

let anyFailure = false;
function report(name: string, result: CheckResult) {
  results.push({ name, ok: result.ok, detail: result.detail });
  if (!result.ok) anyFailure = true;
  console.log(`[${result.ok ? "PASS" : "FAIL"}] ${name}`);
  if (result.detail) console.log(`       ${result.detail}`);
}

/** Locked plan catalogue — must mirror the seed exactly. */
const EXPECTED_PLANS = [
  { name: "Beginner", price: 120000n, dailyReturnRateBps: 100, sortOrder: 1 },
  { name: "Intermediate", price: 160000n, dailyReturnRateBps: 125, sortOrder: 2 },
  { name: "Advanced", price: 260000n, dailyReturnRateBps: 150, sortOrder: 3 },
  { name: "VIP Master", price: 400000n, dailyReturnRateBps: 200, sortOrder: 4 },
] as const;

interface DemoUser {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  email: string;
  passwordHash: string;
}

/** A unique throwaway demo user builder — namespaced so real data is never touched. */
function demoUser(suffix: string): DemoUser {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return {
    firstName: "Verify",
    lastName: "Throwaway",
    username: `verify-${suffix}-${stamp}`.toLowerCase(),
    phone: "03000000000",
    email: `verify-${suffix}-${stamp}@veltra.local`,
    passwordHash: "verify-not-a-real-hash",
  };
}

async function checkPlans() {
  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: "asc" } });
  if (plans.length !== 4) {
    report("4 plans with exact locked prices", {
      ok: false,
      detail: `Expected 4 plans, found ${plans.length}.`,
    });
    return plans;
  }
  for (let i = 0; i < 4; i++) {
    const expected = EXPECTED_PLANS[i];
    const found = plans[i];
    if (
      found.name !== expected.name ||
      found.price !== expected.price ||
      found.dailyReturnRateBps !== expected.dailyReturnRateBps ||
      found.sortOrder !== expected.sortOrder
    ) {
      report("4 plans with exact locked prices", {
        ok: false,
        detail: `Mismatch at position ${i + 1}: expected ${expected.name} price=${expected.price} bps=${expected.dailyReturnRateBps} order=${expected.sortOrder}, got ${found.name} price=${found.price} bps=${found.dailyReturnRateBps} order=${found.sortOrder}`,
      });
      return plans;
    }
  }
  report("4 plans with exact locked prices", {
    ok: true,
    detail: "Beginner/Intermediate/Advanced/VIP Master at 120000/160000/260000/400000 paisa.",
  });
  return plans;
}

async function checkSuperAdmin() {
  const username = process.env.ADMIN_USERNAME?.trim();
  if (!username) {
    report("super admin exists", {
      ok: false,
      detail: "ADMIN_USERNAME is not set in the environment.",
    });
    return null;
  }
  const admin = await prisma.admin.findUnique({ where: { username } });
  report("super admin exists", {
    ok: Boolean(admin),
    detail: admin ? `Found super admin "${username}" (created ${admin.createdAt.toISOString()}).` : `No admin with username "${username}".`,
  });
  return admin;
}

async function checkSettings() {
  const settings = await prisma.setting.findMany();
  const minWithdrawalPaisa = settings.find((s) => s.key === "minWithdrawalPaisa");
  const feedEnabled = settings.find((s) => s.key === "feedEnabled");
  const ok = minWithdrawalPaisa?.value === "0" && feedEnabled?.value === "true";
  report("both default settings exist", {
    ok,
    detail: ok
      ? "minWithdrawalPaisa='0', feedEnabled='true'."
      : `Found: ${settings.map((s) => `${s.key}=${s.value}`).join(", ") || "none"}`,
  });
}

async function checkPartialIndex() {
  const rows = await prisma.$queryRawUnsafe<{ indexname: string; indexdef: string }[]>(
    `SELECT indexname, indexdef FROM pg_indexes WHERE indexname = 'deposits_tid_live_unique'`
  );
  const def = rows[0]?.indexdef ?? "";
  const shapeOK =
    rows.length === 1 &&
    def.includes("CREATE UNIQUE INDEX") &&
    def.includes("tid") &&
    def.toUpperCase().includes("PENDING") &&
    def.toUpperCase().includes("APPROVED");
  report("partial unique index deposits_tid_live_unique exists", {
    ok: shapeOK,
    detail: def || "Index not found in pg_indexes.",
  });
}

type CleanTask = () => Promise<unknown>;

/** Best-effort cleanup: delete throwaway rows even if a check fails mid-flight. */
async function cleanupTasks(tasks: CleanTask[]) {
  for (const task of tasks) {
    try {
      await task();
    } catch {
      // A counter that already got cleaned, or a parent row still referenced —
      // report nothing; checks after this one do not depend on throwaway rows.
    }
  }
}

async function checkDuplicateTidRejected(plans: { id: string; price: bigint }[]) {
  const plan = plans[0];
  const tid = `VERIFY-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const userA = await prisma.user.create({ data: demoUser("a") });
  const userB = await prisma.user.create({ data: demoUser("b") });
  const base = {
    planId: plan.id,
    name: "Verify Throwaway",
    email: "verify@veltra.local",
    senderNumber: "03000000000",
    amount: plan.price,
  };

  // Cleanup runs even if an insert/query throws an unexpected error type mid-check.
  const cleanup: CleanTask[] = [];
  try {
    const first = await prisma.deposit.create({
      data: { ...base, userId: userA.id, tid, status: "PENDING" },
    });
    cleanup.push(() => prisma.deposit.delete({ where: { id: first.id } }));

    let secondError: unknown = null;
    try {
      await prisma.deposit.create({
        data: { ...base, userId: userB.id, tid, status: "PENDING" },
      });
    } catch (error) {
      secondError = error;
    }

    const code =
      secondError instanceof Prisma.PrismaClientKnownRequestError ? secondError.code : "";
    report("same TID cannot be PENDING twice (second insert throws)", {
      ok:
        secondError !== null &&
        secondError instanceof Prisma.PrismaClientKnownRequestError &&
        secondError.code === "P2002",
      detail:
        secondError === null
          ? "Second insert UNEXPECTEDLY succeeded."
          : `Second insert rejected with ${
              secondError instanceof Prisma.PrismaClientKnownRequestError
                ? `Prisma ${code}`
                : "unknown error type"
            }.`,
    });
  } finally {
    await cleanupTasks([...cleanup, () => prisma.user.delete({ where: { id: userA.id } }), () => prisma.user.delete({ where: { id: userB.id } })]);
  }
  return tid;
}

async function checkRejectedTidReusable(plans: { id: string; price: bigint }[], tid: string) {
  const userA = await prisma.user.create({ data: demoUser("c") });
  const userB = await prisma.user.create({ data: demoUser("d") });
  const base = {
    planId: plans[0].id,
    name: "Verify Throwaway",
    email: "verify@veltra.local",
    senderNumber: "03000000000",
    amount: plans[0].price,
  };

  const cleanup: CleanTask[] = [];
  try {
    const first = await prisma.deposit.create({
      data: { ...base, userId: userA.id, tid, status: "PENDING" },
    });
    cleanup.push(() => prisma.deposit.delete({ where: { id: first.id } }));

    // Move the first one to REJECTED: the TID leaves the "live" set.
    await prisma.deposit.update({
      where: { id: first.id },
      data: { status: "REJECTED", rejectionReason: "verify-foundation" },
    });

    let createdSecond: string | null = null;
    let failure: Error | null = null;
    try {
      const second = await prisma.deposit.create({
        data: { ...base, userId: userB.id, tid, status: "PENDING" },
      });
      createdSecond = second.id;
      cleanup.push(() => prisma.deposit.delete({ where: { id: second.id } }));
    } catch (error) {
      failure = error instanceof Error ? error : new Error(String(error));
    }

    report("rejected TID may be re-submitted (same TID PENDING again succeeds)", {
      ok: createdSecond !== null,
      detail: createdSecond !== null ? "Re-submitted PENDING deposit accepted after REJECT." : `Unexpectedly rejected: ${failure?.message ?? "unknown error"}`,
    });
  } finally {
    await cleanupTasks([...cleanup, () => prisma.user.delete({ where: { id: userA.id } }), () => prisma.user.delete({ where: { id: userB.id } })]);
  }
}

async function main() {
  console.log("Veltra M0 foundation verification");
  console.log("=================================");
  const plans = await checkPlans();
  await checkSuperAdmin();
  await checkSettings();
  await checkPartialIndex();
  if (plans.length > 0 && results[0].ok) {
    const tid = await checkDuplicateTidRejected(plans);
    await checkRejectedTidReusable(plans, tid);
  } else {
    report("same TID cannot be PENDING twice (second insert throws)", {
      ok: false,
      detail: "Skipped: plan checks failed.",
    });
    report("rejected TID may be re-submitted (same TID PENDING again succeeds)", {
      ok: false,
      detail: "Skipped: plan checks failed.",
    });
  }

  const passed = results.filter((r) => r.ok).length;
  console.log("");
  console.log(`${passed}/${results.length} checks passed.`);
  if (anyFailure) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error("Verification script crashed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
