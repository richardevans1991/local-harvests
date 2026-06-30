import { PrismaClient } from "@prisma/client";
import {
  DEMO_FARMER_EMAILS,
  DEMO_FARMER_USER_IDS,
  DEMO_FARM_IDS,
} from "../src/lib/demo-data";

const prisma = new PrismaClient();

async function main() {
  const demoFarms = await prisma.farm.findMany({
    where: { id: { in: DEMO_FARM_IDS } },
    select: { id: true, name: true },
  });

  const realFarms = await prisma.farm.findMany({
    where: { id: { notIn: DEMO_FARM_IDS } },
    select: { id: true, name: true },
  });

  console.log("Real farms (untouched):");
  if (realFarms.length === 0) {
    console.log("  (none in database)");
  } else {
    realFarms.forEach((farm) => console.log(`  ✓ ${farm.name} (${farm.id})`));
  }

  if (demoFarms.length === 0) {
    console.log("\nNo seeded demo farms found — nothing to remove.");
    return;
  }

  console.log("\nRemoving seeded demo farms only:");
  demoFarms.forEach((farm) => console.log(`  ✗ ${farm.name} (${farm.id})`));

  await prisma.orderItem.deleteMany({
    where: { farmId: { in: DEMO_FARM_IDS } },
  });

  await prisma.product.deleteMany({
    where: { farmId: { in: DEMO_FARM_IDS } },
  });

  await prisma.farmCategory.deleteMany({
    where: { farmId: { in: DEMO_FARM_IDS } },
  });

  await prisma.farm.deleteMany({
    where: { id: { in: DEMO_FARM_IDS } },
  });

  const demoUsers = await prisma.user.findMany({
    where: {
      OR: [{ id: { in: DEMO_FARMER_USER_IDS } }, { email: { in: DEMO_FARMER_EMAILS } }],
    },
    select: { id: true, email: true },
  });

  if (demoUsers.length > 0) {
    console.log("\nRemoving demo farmer accounts:");
    demoUsers.forEach((user) => console.log(`  ✗ ${user.email}`));
    await prisma.user.deleteMany({
      where: { id: { in: demoUsers.map((user) => user.id) } },
    });
  }

  console.log(`\nDone. Removed ${demoFarms.length} demo farm(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });