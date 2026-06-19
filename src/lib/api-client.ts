import type { Farm, FarmCategory, FulfillmentMethod, Product, UserRole } from "@/types";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  farmId?: string;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Request failed");
    }
    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  auth: {
    me: () => request<{ user: PublicUser | null }>("/api/auth/me"),
    login: (email: string, password: string, role: UserRole) =>
      request<{ user: PublicUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, role }),
      }),
    register: (email: string, password: string, name: string, role: UserRole) =>
      request<{ user: PublicUser }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name, role }),
      }),
    logout: () => request<{ success: boolean }>("/api/auth/logout", { method: "POST" }),
  },
  farms: {
    list: () => request<{ farms: Farm[] }>("/api/farms"),
    get: (id: string) =>
      request<{ farm: Farm; products: Product[]; categories: FarmCategory[] }>(
        `/api/farms/${id}`
      ),
    update: (id: string, data: Partial<Farm>) =>
      request<{ farm: Farm }>(`/api/farms/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },
  categories: {
    create: (farmId: string, name: string) =>
      request<{ category: FarmCategory }>("/api/categories", {
        method: "POST",
        body: JSON.stringify({ farmId, name }),
      }),
    update: (id: string, name: string) =>
      request<{ category: FarmCategory }>(`/api/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    remove: (id: string) =>
      request<{ success: boolean }>(`/api/categories/${id}`, { method: "DELETE" }),
  },
  products: {
    create: (farmId: string, data: Omit<Product, "id" | "farmId">) =>
      request<{ product: Product }>("/api/products", {
        method: "POST",
        body: JSON.stringify({ farmId, ...data }),
      }),
    update: (id: string, data: Partial<Product>) =>
      request<{ product: Product }>(`/api/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<{ success: boolean }>(`/api/products/${id}`, { method: "DELETE" }),
  },
  checkout: {
    fulfillmentOptions: (farmIds: string[]) =>
      request<{
        pickupAvailable: boolean;
        deliveryAvailable: boolean;
        blockingDeliveryFarms: string[];
        farms: Pick<Farm, "id" | "name" | "offersPickup" | "offersDelivery" | "deliveryNotes">[];
      }>("/api/checkout/fulfillment-options", {
        method: "POST",
        body: JSON.stringify({ farmIds }),
      }),
    createSession: (payload: {
      items: {
        productId: string;
        farmId: string;
        name: string;
        price: number;
        quantity: number;
        image: string;
      }[];
      customerName: string;
      email: string;
      phone: string;
      pickupDate: string;
      fulfillmentMethod?: FulfillmentMethod;
      deliveryAddress?: string;
      notes?: string;
    }) =>
      request<{ url?: string; orderId?: string; mode: "stripe" | "pickup" }>(
        "/api/checkout",
        { method: "POST", body: JSON.stringify(payload) }
      ),
    verify: (sessionId: string) =>
      request<{
        order: {
          id: string;
          customerName: string;
          email: string;
          pickupDate: string;
          fulfillmentMethod: FulfillmentMethod;
          deliveryAddress?: string | null;
          total: number;
        };
      }>(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`),
    completePickup: (orderId: string) =>
      request<{
        order: {
          id: string;
          customerName: string;
          email: string;
          pickupDate: string;
          fulfillmentMethod: FulfillmentMethod;
          deliveryAddress?: string | null;
          total: number;
        };
      }>("/api/checkout/complete-pickup", {
        method: "POST",
        body: JSON.stringify({ orderId }),
      }),
    stripeEnabled: () =>
      request<{ enabled: boolean }>("/api/checkout/config"),
  },
};