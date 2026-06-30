import { DEMO_FARMERS, SAMPLE_FARMS } from "@/lib/sample-data";

export const DEMO_FARM_IDS = SAMPLE_FARMS.map((farm) => farm.id);
export const DEMO_FARMER_USER_IDS = DEMO_FARMERS.map((user) => user.id);
export const DEMO_FARMER_EMAILS = DEMO_FARMERS.map((user) => user.email);

export function isDemoFarmId(id: string) {
  return DEMO_FARM_IDS.includes(id);
}