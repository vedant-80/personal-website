import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


async function main() {
  const flairs = [
    { name: "Technical", slug: "technical", sortOrder: 1 },
    { name: "College", slug: "college", sortOrder: 2 },
    { name: "Running", slug: "running", sortOrder: 3 },
    { name: "Life", slug: "life", sortOrder: 4 },
  ];

  for (const flair of flairs) {
    await prisma.flair.upsert({
      where: { slug: flair.slug },
      update: { name: flair.name, sortOrder: flair.sortOrder, isActive: true },
      create: { ...flair, isActive: true },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

