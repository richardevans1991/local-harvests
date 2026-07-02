import type { Prisma } from "@prisma/client";
import {
  createFarmId,
  DEFAULT_FARM_BANNER,
  DEFAULT_FARM_DESCRIPTION,
  DEFAULT_FARM_IMAGE,
  DEFAULT_FARM_SHORT_DESCRIPTION,
} from "@/lib/farm-defaults";
import { prisma } from "@/lib/prisma";
import { resolveFarmCoordinates } from "@/lib/uk-geography";

interface CreateFarmerFarmInput {
  ownerId: string;
  name: string;
  location: string;
  postcode?: string;
}

type DbClient = Prisma.TransactionClient | typeof prisma;

export async function createFarmerFarm(
  { ownerId, name, location, postcode }: CreateFarmerFarmInput,
  db: DbClient = prisma
) {
  const trimmedName = name.trim();
  const trimmedLocation = location.trim();

  if (!trimmedName || !trimmedLocation) {
    throw new Error("Farm name and location are required.");
  }

  const existing = await db.farm.findFirst({
    where: { ownerId },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Your account already has a farm shop.");
  }

  let farmId = createFarmId(trimmedName);
  for (let attempt = 0; attempt < 5; attempt++) {
    const collision = await db.farm.findUnique({ where: { id: farmId }, select: { id: true } });
    if (!collision) break;
    farmId = createFarmId(trimmedName);
  }

  const coordinates = await resolveFarmCoordinates(postcode, trimmedLocation);

  return db.farm.create({
    data: {
      id: farmId,
      name: trimmedName,
      location: trimmedLocation,
      postcode: coordinates.postcode,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      shortDescription: DEFAULT_FARM_SHORT_DESCRIPTION,
      description: DEFAULT_FARM_DESCRIPTION,
      image: DEFAULT_FARM_IMAGE,
      banner: DEFAULT_FARM_BANNER,
      distance: 0,
      offersPickup: true,
      offersDelivery: false,
      deliveryFee: 0,
      shopOpen: true,
      ownerId,
    },
  });
}