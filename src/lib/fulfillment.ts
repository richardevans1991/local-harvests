import type { Farm } from "@/types";

export type FulfillmentMethod = "pickup" | "delivery";

export function getFulfillmentOptions(farms: Pick<Farm, "id" | "name" | "offersPickup" | "offersDelivery">[]) {
  const pickupAvailable = farms.length > 0 && farms.every((f) => f.offersPickup);
  const deliveryAvailable = farms.length > 0 && farms.every((f) => f.offersDelivery);
  const blockingDeliveryFarms = farms
    .filter((f) => !f.offersDelivery)
    .map((f) => f.name);

  return {
    pickupAvailable,
    deliveryAvailable,
    blockingDeliveryFarms,
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