import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getDefaultCategoryImage } from "../src/lib/category-images";
import { DEMO_FARM_IDS } from "../src/lib/demo-data";
import { DEMO_FARMERS, SAMPLE_FARMS, SAMPLE_PRODUCTS } from "../src/lib/sample-data";

const prisma = new PrismaClient();

async function seedDemoData() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.farmCategory.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("farmer123", 10);
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 30);

  for (const farmer of DEMO_FARMERS) {
    await prisma.user.create({
      data: {
        id: farmer.id,
        email: farmer.email,
        passwordHash,
        name: farmer.name,
        role: farmer.role,
        subscriptionTier: "starter",
        subscriptionStatus: "trialing",
        trialEndsAt,
      },
    });
  }

  for (const farm of SAMPLE_FARMS) {
    await prisma.farm.create({
      data: {
        id: farm.id,
        name: farm.name,
        description: farm.description,
        shortDescription: farm.shortDescription,
        image: farm.image,
        banner: farm.banner,
        location: farm.location,
        distance: farm.distance,
        ownerId: farm.ownerId,
        offersPickup: farm.offersPickup,
        offersDelivery: farm.offersDelivery,
        shopOpen: farm.shopOpen,
        deliveryNotes: farm.deliveryNotes ?? null,
      },
    });
  }

  for (const product of SAMPLE_PRODUCTS) {
    await prisma.product.create({
      data: {
        id: product.id,
        farmId: product.farmId,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
      },
    });
  }

  const categoryPairs = Array.from(
    new Map(
      SAMPLE_PRODUCTS.map((p) => [
        `${p.farmId}:${p.category}`,
        { farmId: p.farmId, name: p.category },
      ])
    ).values()
  );

  for (const { farmId, name } of categoryPairs) {
    await prisma.farmCategory.create({
      data: { farmId, name, image: getDefaultCategoryImage(name) },
    });
  }

  console.log("Database seeded with demo farms, products, and farmers.");
}

async function main() {
  const totalFarms = await prisma.farm.count();
  const realFarmCount = await prisma.farm.count({
    where: { id: { notIn: DEMO_FARM_IDS } },
  });

  if (totalFarms > 0 && realFarmCount > 0) {
    console.log(
      "Skipping seed — real farm data exists. Set SEED_FORCE=true to wipe and reseed (not recommended in production)."
    );
    return;
  }

  if (totalFarms > 0 && realFarmCount === 0) {
    console.log("Only demo farms in database — leaving as-is. Use the admin cleanup endpoint to remove them.");
    return;
  }

  if (process.env.NODE_ENV === "production" && process.env.SEED_FORCE !== "true") {
    console.log(
      "Production database is empty — skipping demo seed. Register a real farm, or set SEED_FORCE=true to load demos."
    );
    return;
  }

  await seedDemoData();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });