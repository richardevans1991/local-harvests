import type { Farm, Product, User } from "@/types";

export const SAMPLE_FARMS: Farm[] = [
  {
    id: "farm-green-meadow",
    name: "Green Meadow Farm",
    shortDescription: "Organic vegetables and fresh dairy from rolling pastures.",
    description:
      "Family-run for three generations, Green Meadow Farm grows seasonal produce and raises grass-fed dairy cows. Visit us for the freshest harvest in North Valley.",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=400&fit=crop",
    location: "North Valley",
    distance: 2.4,
    ownerId: "user-farmer-green-meadow",
    offersPickup: true,
    offersDelivery: false,
  },
  {
    id: "farm-oak-hill",
    name: "Oak Hill Orchard",
    shortDescription: "Artisan breads, pastries, and hand-crafted preserves.",
    description:
      "Oak Hill Orchard combines heritage fruit trees with a stone-oven bakery. Our honey and jams are made from ingredients grown right on the property.",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=400&fit=crop",
    location: "East Meadow",
    distance: 4.1,
    ownerId: "user-farmer-oak-hill",
    offersPickup: true,
    offersDelivery: false,
  },
  {
    id: "farm-sunny-brook",
    name: "Sunny Brook Ranch",
    shortDescription: "Pasture-raised meats and farm-fresh eggs daily.",
    description:
      "Sunny Brook Ranch raises heritage breed cattle and free-range hens on open pasture. Ethical farming practices you can taste in every bite.",
    image:
      "https://images.unsplash.com/photo-1500595046743-be5934b43ec2?w=600&h=400&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1560493676-04071c5f467d?w=1200&h=400&fit=crop",
    location: "West Hills",
    distance: 5.8,
    ownerId: "user-farmer-sunny-brook",
    offersPickup: true,
    offersDelivery: false,
  },
  {
    id: "farm-valley-creamery",
    name: "Valley Creamery",
    shortDescription: "Award-winning artisan cheeses and cultured dairy.",
    description:
      "Valley Creamery crafts small-batch cheeses from local milk. From creamy brie to sharp aged cheddar, discover flavors rooted in our region.",
    image:
      "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&h=400&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=1200&h=400&fit=crop",
    location: "South Creek",
    distance: 3.2,
    ownerId: "user-farmer-valley-creamery",
    offersPickup: true,
    offersDelivery: true,
    deliveryNotes: "Local delivery within 8 miles, Tue–Sat.",
  },
];

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    farmId: "farm-green-meadow",
    name: "Heirloom Tomato Bundle",
    description: "Mixed heirloom tomatoes, picked at peak ripeness.",
    price: 6.5,
    image:
      "https://images.unsplash.com/photo-1592925110749-5ed303d2fe9f?w=400&h=300&fit=crop",
    category: "Vegetables & Produce",
  },
  {
    id: "prod-2",
    farmId: "farm-green-meadow",
    name: "Farmhouse Whole Milk",
    description: "Creamy whole milk from grass-fed cows, 1 gallon.",
    price: 5.25,
    image:
      "https://images.unsplash.com/photo-1563636619-91430370a1b0?w=400&h=300&fit=crop",
    category: "Dairy & Milk",
  },
  {
    id: "prod-3",
    farmId: "farm-green-meadow",
    name: "Seasonal Greens Box",
    description: "Kale, spinach, and chard — perfect for weekly meals.",
    price: 8.0,
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
    category: "Vegetables & Produce",
  },
  {
    id: "prod-4",
    farmId: "farm-oak-hill",
    name: "Sourdough Loaf",
    description: "Slow-fermented sourdough baked in our stone oven.",
    price: 7.5,
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
    category: "Bakery",
  },
  {
    id: "prod-5",
    farmId: "farm-oak-hill",
    name: "Wildflower Honey",
    description: "Raw wildflower honey, 12 oz jar.",
    price: 12.0,
    image:
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop",
    category: "Honey & Jams",
  },
  {
    id: "prod-6",
    farmId: "farm-oak-hill",
    name: "Strawberry Jam",
    description: "Small-batch jam made from orchard strawberries.",
    price: 9.5,
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
    category: "Honey & Jams",
  },
  {
    id: "prod-7",
    farmId: "farm-sunny-brook",
    name: "Grass-Fed Beef Steaks",
    description: "Two 8 oz ribeye steaks, pasture-raised.",
    price: 24.0,
    image:
      "https://images.unsplash.com/photo-1603048588665-791ca8aea7c3?w=400&h=300&fit=crop",
    category: "Meat & Poultry",
  },
  {
    id: "prod-8",
    farmId: "farm-sunny-brook",
    name: "Free-Range Eggs",
    description: "Dozen large brown eggs from free-range hens.",
    price: 6.0,
    image:
      "https://images.unsplash.com/photo-1582722872405-a63d7b1ac3e3?w=400&h=300&fit=crop",
    category: "Eggs",
  },
  {
    id: "prod-9",
    farmId: "farm-sunny-brook",
    name: "Whole Chicken",
    description: "Pasture-raised whole chicken, approx. 4 lbs.",
    price: 18.5,
    image:
      "https://images.unsplash.com/photo-1604503468506-a8da13d5d3ea?w=400&h=300&fit=crop",
    category: "Meat & Poultry",
  },
  {
    id: "prod-10",
    farmId: "farm-valley-creamery",
    name: "Aged Cheddar Block",
    description: "Sharp aged cheddar, 12 months, 8 oz.",
    price: 11.0,
    image:
      "https://images.unsplash.com/photo-1618164436266-4461e7f6096e?w=400&h=300&fit=crop",
    category: "Cheese",
  },
  {
    id: "prod-11",
    farmId: "farm-valley-creamery",
    name: "Creamy Brie Wheel",
    description: "Soft-ripened brie with a buttery finish.",
    price: 14.5,
    image:
      "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&h=300&fit=crop",
    category: "Cheese",
  },
  {
    id: "prod-12",
    farmId: "farm-valley-creamery",
    name: "Greek Yogurt Tub",
    description: "Thick cultured yogurt, plain, 32 oz.",
    price: 7.75,
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
    category: "Dairy & Milk",
  },
];

export const DEMO_FARMERS: User[] = [
  {
    id: "user-farmer-green-meadow",
    email: "farmer@greenmeadow.com",
    name: "Sarah Mitchell",
    role: "farmer",
    farmId: "farm-green-meadow",
  },
  {
    id: "user-farmer-oak-hill",
    email: "farmer@oakhill.com",
    name: "James Oakley",
    role: "farmer",
    farmId: "farm-oak-hill",
  },
  {
    id: "user-farmer-sunny-brook",
    email: "farmer@sunnybrook.com",
    name: "Maria Santos",
    role: "farmer",
    farmId: "farm-sunny-brook",
  },
  {
    id: "user-farmer-valley-creamery",
    email: "farmer@valleycreamery.com",
    name: "Tom Berger",
    role: "farmer",
    farmId: "farm-valley-creamery",
  },
];