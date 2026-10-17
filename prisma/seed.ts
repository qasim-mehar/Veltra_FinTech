/**
 * Veltra — Milestone 0 seed.
 *
 * Idempotent: every write is an upsert (by natural key), so running the seed twice
 * never duplicates rows. Run with `npm run db:seed` (tsx) or via `prisma migrate reset`.
 *
 * Seeds:
 *  - The 4 locked investment plans (prices in integer paisa).
 *  - The single super admin from ADMIN_USERNAME / ADMIN_PASSWORD env vars.
 *  - The two default settings.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Locked plan catalogue. Prices are integer paisa: Rs. 1,200 = 120000. */
const PLANS = [
  { name: "Beginner", price: 120000n, dailyReturnRateBps: 100, sortOrder: 1 },
  { name: "Intermediate", price: 160000n, dailyReturnRateBps: 125, sortOrder: 2 },
  { name: "Advanced", price: 260000n, dailyReturnRateBps: 150, sortOrder: 3 },
  { name: "VIP Master", price: 400000n, dailyReturnRateBps: 200, sortOrder: 4 },
] as const;

const SETTINGS = [
  { key: "minWithdrawalPaisa", value: "0" },
  { key: "feedEnabled", value: "true" },
] as const;

async function seedPlans() {
  for (const plan of PLANS) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {
        price: plan.price,
        dailyReturnRateBps: plan.dailyReturnRateBps,
        sortOrder: plan.sortOrder,
        isActive: true,
      },
      create: plan,
    });
  }
  console.log(`Seeded ${PLANS.length} plans.`);
  console.log("Daily rates are placeholders pending client confirmation.");
}

async function seedSuperAdmin() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "ADMIN_USERNAME and ADMIN_PASSWORD must be set (see .env.example) to seed the super admin."
    );
  }

  // Create only if the username does not exist. Never mutate an existing admin,
  // and never print the password or its hash.
  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    console.log(`Super admin "${username}" already exists — skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.admin.create({
    data: {
      username,
      // Deterministic placeholder mailbox; does not collide because the username is unique.
      email: `${username.toLowerCase()}@veltra.local`,
      passwordHash,
    },
  });
  console.log(`Seeded super admin "${username}".`);
}

async function seedSettings() {
  for (const setting of SETTINGS) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`Seeded ${SETTINGS.length} settings.`);
}

async function main() {
  await seedPlans();
  await seedSuperAdmin();
  await seedSettings();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error instanceof Error ? error.message : error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
