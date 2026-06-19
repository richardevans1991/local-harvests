import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEMO_FARMERS, SAMPLE_FARMS, SAMPLE_PRODUCTS } from "../src/lib/sample-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("farmer123", 10);

  for (const farmer of DEMO_FARMERS) {
    await prisma.user.create({
      data: {
        id: farmer.id,
        email: farmer.email,
        passwordHash,
        name: farmer.name,
        role: farmer.role,
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

  console.log("Database seeded with farms, products, and demo farmers.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });