const { PrismaClient } = require("@prisma/client");

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? "(not set)";
  const prisma = new PrismaClient();
  try {
    const farmCount = await prisma.farm.count();
    const userCount = await prisma.user.count({ where: { role: "farmer" } });
    console.log(`[startup] DATABASE_URL=${databaseUrl}`);
    console.log(`[startup] Farms: ${farmCount}, farmer accounts: ${userCount}`);

    if (farmCount === 0) {
      console.warn(
        "[startup] WARNING: No farms in database. In production, set DATABASE_URL=file:/app/data/dev.db and mount a Railway volume at /app/data."
      );
    }

    if (
      process.env.NODE_ENV === "production" &&
      !databaseUrl.includes("/app/data/")
    ) {
      console.warn(
        "[startup] WARNING: DATABASE_URL does not use /app/data — data may not persist across deploys."
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[startup] Database check failed:", error);
  process.exit(1);
});