import type { FulfillmentMethod } from "@/types";

export interface FarmDeliveryFeeLine {
  farmId: string;
  farmName: string;
  fee: number;
}

export function normalizeDeliveryFee(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100) / 100;
}

export function buildFarmDeliveryFees(
  farms: { id: string; name: string; deliveryFee: number }[],
  fulfillmentMethod: FulfillmentMethod
): FarmDeliveryFeeLine[] {
  if (fulfillmentMethod !== "delivery") return [];
  return farms.map((farm) => ({
    farmId: farm.id,
    farmName: farm.name,
    fee: normalizeDeliveryFee(farm.deliveryFee),
  }));
}

export function sumDeliveryFees(lines: FarmDeliveryFeeLine[]): number {
  return Math.round(lines.reduce((sum, line) => sum + line.fee, 0) * 100) / 100;
}

export function parseFarmDeliveryFees(raw: string | null | undefined): FarmDeliveryFeeLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as FarmDeliveryFeeLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((line) => line && typeof line.farmId === "string")
      .map((line) => ({
        farmId: line.farmId,
        farmName: typeof line.farmName === "string" ? line.farmName : "Farm",
        fee: normalizeDeliveryFee(line.fee),
      }));
  } catch {
    return [];
  }
}

export function deliveryFeeForFarm(
  raw: string | null | undefined,
  farmId: string
): number {
  const line = parseFarmDeliveryFees(raw).find((entry) => entry.farmId === farmId);
  return line?.fee ?? 0;
}