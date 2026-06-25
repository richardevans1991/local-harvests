import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 30);

  const result = await prisma.user.updateMany({
    where: { role: "farmer", subscriptionStatus: "none" },
    data: {
      subscriptionTier: "starter",
      subscriptionStatus: "trialing",
      trialEndsAt,
    },
  });

  console.log(`Updated ${result.count} farmer(s) with a 30-day free trial.`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });