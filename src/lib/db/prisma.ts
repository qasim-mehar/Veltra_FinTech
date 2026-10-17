import { PrismaClient } from "@prisma/client";

// Prisma singleton. In development the client is cached on globalThis so Next.js
// hot reload does not exhaust the database connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
