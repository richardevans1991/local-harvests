import { PrismaClient } from "@prisma/client";
import { getDefaultCategoryImage } from "../src/lib/category-images";

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.farmCategory.findMany();

  let updated = 0;
  for (const category of categories) {
    const image = getDefaultCategoryImage(category.name);
    if (!image || category.image === image) continue;

    await prisma.farmCategory.update({
      where: { id: category.id },
      data: { image },
    });
    updated += 1;
    console.log(`  ${category.name}`);
  }

  console.log(`Updated ${updated} categor${updated === 1 ? "y" : "ies"} with default images.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });