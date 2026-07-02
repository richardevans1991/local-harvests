import { sumDeliveryFees, buildFarmDeliveryFees } from "@/lib/delivery-fee";
import type { Farm } from "@/types";

export type FulfillmentMethod = "pickup" | "delivery";

export function getFulfillmentOptions(
  farms: Pick<
    Farm,
    "id" | "name" | "offersPickup" | "offersDelivery" | "deliveryNotes" | "deliveryFee"
  >[]
) {
  const pickupAvailable = farms.length > 0 && farms.every((f) => f.offersPickup);
  const deliveryAvailable = farms.length > 0 && farms.every((f) => f.offersDelivery);
  const blockingDeliveryFarms = farms
    .filter((f) => !f.offersDelivery)
    .map((f) => f.name);
  const deliveryFeeLines = buildFarmDeliveryFees(
    farms.map((farm) => ({
      id: farm.id,
      name: farm.name,
      deliveryFee: farm.deliveryFee ?? 0,
    })),
    "delivery"
  );
  const totalDeliveryFee = sumDeliveryFees(deliveryFeeLines);

  return {
    pickupAvailable,
    deliveryAvailable,
    blockingDeliveryFarms,
    totalDeliveryFee,
    farms,
  };
}

export function validateFulfillmentChoice(
  method: FulfillmentMethod,
  farms: Pick<Farm, "offersPickup" | "offersDelivery">[]
) {
  const options = getFulfillmentOptions(
    farms.map((f, i) => ({
      id: String(i),
      name: "",
      offersPickup: f.offersPickup,
      offersDelivery: f.offersDelivery,
      deliveryFee: 0,
      deliveryNotes: null,
    }))
  );

  if (method === "pickup" && !options.pickupAvailable) {
    return "Click & collect is not available for all farms in your cart.";
  }
  if (method === "delivery" && !options.deliveryAvailable) {
    return "Delivery is not available for all farms in your cart.";
  }
  return null;
}