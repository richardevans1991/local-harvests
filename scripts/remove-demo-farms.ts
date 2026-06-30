import { PrismaClient } from "@prisma/client";
import { DEMO_FARMERS, SAMPLE_FARMS } from "../src/lib/sample-data";

const prisma = new PrismaClient();

const KEEP_NAME_MATCH = "ringwood";

function isKeptFarm(name: string) {
  return name.toLowerCase().includes(KEEP_NAME_MATCH);
}

async function main() {
  const farms = await prisma.farm.findMany({
    select: { id: true, name: true, ownerId: true },
  });

  const kept = farms.filter((farm) => isKeptFarm(farm.name));
  const removing = farms.filter((farm) => !isKeptFarm(farm.name));

  if (kept.length === 0) {
    console.error(
      `No farm matching "${KEEP_NAME_MATCH}" found. Aborting so nothing is deleted by mistake.`
    );
    process.exit(1);
  }

  if (removing.length === 0) {
    console.log("Nothing to remove — only the kept farm(s) are present:");
    kept.forEach((farm) => console.log(`  ✓ ${farm.name} (${farm.id})`));
    return;
  }

  const removeIds = removing.map((farm) => farm.id);
  const keptOwnerIds = new Set(kept.map((farm) => farm.ownerId));
  const demoUserIds = DEMO_FARMERS.map((user) => user.id);
  const demoFarmIds = SAMPLE_FARMS.map((farm) => farm.id);

  console.log("Keeping:");
  kept.forEach((farm) => console.log(`  ✓ ${farm.name} (${farm.id})`));

  console.log("Removing farms:");
  removing.forEach((farm) => console.log(`  ✗ ${farm.name} (${farm.id})`));

  await prisma.orderItem.deleteMany({
    where: { farmId: { in: removeIds } },
  });

  await prisma.product.deleteMany({
    where: { farmId: { in: removeIds } },
  });

  await prisma.farmCategory.deleteMany({
    where: { farmId: { in: removeIds } },
  });

  await prisma.farm.deleteMany({
    where: { id: { in: removeIds } },
  });

  const usersToDelete = await prisma.user.findMany({
    where: {
      role: "farmer",
      id: { notIn: Array.from(keptOwnerIds) },
      OR: [
        { id: { in: demoUserIds } },
        { farm: null },
      ],
    },
    select: { id: true, email: true },
  });

  if (usersToDelete.length > 0) {
    console.log("Removing farmer accounts:");
    usersToDelete.forEach((user) => console.log(`  ✗ ${user.email}`));
    await prisma.user.deleteMany({
      where: { id: { in: usersToDelete.map((user) => user.id) } },
    });
  }

  console.log("\nDone.");
  console.log(`Removed ${removing.length} farm(s) (${demoFarmIds.filter((id) => removeIds.includes(id)).length} were seeded demos).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });