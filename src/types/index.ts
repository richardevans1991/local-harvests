export type UserRole = "customer" | "farmer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  farmId?: string;
}

export type ProductCategory = string;

export interface FarmCategory {
  id: string;
  farmId: string;
  name: string;
  image?: string | null;
}

export interface Product {
  id: string;
  farmId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: ProductCategory;
}

export interface Farm {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  image: string;
  banner: string;
  location: string;
  postcode?: string | null;
  distance: number;
  distanceMiles?: number | null;
  ownerId: string;
  offersPickup: boolean;
  offersDelivery: boolean;
  shopOpen: boolean;
  deliveryNotes?: string | null;
}

export type FulfillmentMethod = "pickup" | "delivery";

export interface CartItem {
  productId: string;
  farmId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export const DEFAULT_PRODUCT_CATEGORIES = [
  "Meat & Poultry",
  "Bakery",
  "Dairy & Milk",
  "Vegetables & Produce",
  "Eggs",
  "Honey & Jams",
  "Cheese",
] as const;

export const LOCATIONS = [
  "All Locations",
  "North Valley",
  "East Meadow",
  "West Hills",
  "South Creek",
];