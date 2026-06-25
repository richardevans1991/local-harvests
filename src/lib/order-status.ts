export type OrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "ready"
  | "completed"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Awaiting payment",
  paid: "New order",
  confirmed: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const FARMER_ACTIONABLE_STATUSES: OrderStatus[] = [
  "paid",
  "confirmed",
  "ready",
];

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: [],
  paid: ["confirmed", "cancelled"],
  confirmed: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function canTransitionStatus(from: OrderStatus, to: OrderStatus) {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function nextStatusAction(status: OrderStatus): {
  next: OrderStatus;
  label: string;
} | null {
  switch (status) {
    case "paid":
      return { next: "confirmed", label: "Start preparing" };
    case "confirmed":
      return { next: "ready", label: "Mark ready" };
    case "ready":
      return { next: "completed", label: "Mark complete" };
    default:
      return null;
  }
}

export function isFarmerVisibleStatus(status: string) {
  return status !== "pending";
}