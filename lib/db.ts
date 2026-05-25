import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const globalForPrisma = globalThis as unknown as { prisma?: InstanceType<typeof PrismaClient> };

function createClient() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
