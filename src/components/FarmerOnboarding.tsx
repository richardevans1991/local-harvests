"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { isValidImageUrl } from "@/lib/image-utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Farm, FarmCategory } from "@/types";

const STEPS = ["Your shop", "First category", "First product"] as const;

export default function FarmerOnboarding() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const initialized = useAuthStore((s) => s.initialized);
  const initialize = useAuthStore((s) => s.initialize);

  const [step, setStep] = useState(0);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [categories, setCategories] = useState<FarmCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [offersPickup, setOffersPickup] = useState(true);
  const [offersDelivery, setOffersDelivery] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [categoryName, setCategoryName] = useState("");

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImage, setProductImage] = useState(
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop"
  );

  const farmId = currentUser?.farmId;

  useEffect(() => {
    if (!initialized) return;
    if (!currentUser || currentUser.role !== "farmer") {
      router.replace("/farmer/login");
      return;
    }

    if (!farmId) {
      router.replace("/farmer/setup");
      return;
    }

    Promise.all([api.farms.get(farmId), api.farmer.onboarding.get()])
      .then(([{ farm: loadedFarm, categories: loadedCategories }, { onboarding }]) => {
        setFarm(loadedFarm);
        setCategories(loadedCategories);
        setShortDescription(loadedFarm.shortDescription);
        setDescription(loadedFarm.description);
        setLocation(loadedFarm.location);
        setOffersPickup(loadedFarm.offersPickup);
        setOffersDelivery(loadedFarm.offersDelivery);
        setDeliveryNotes(loadedFarm.deliveryNotes ?? "");

        if (onboarding.isComplete) {
          router.replace("/farmer/dashboard");
          return;
        }

        if (onboarding.hasCategory && !onboarding.hasProduct) {
          setStep(2);
          if (loadedCategories[0]) {
            setCategoryName(loadedCategories[0].name);
          }
        } else if (onboarding.profileComplete && !onboarding.hasCategory) {
          setStep(1);
        }
      })
      .catch(() => setError("Failed to load your shop details."))
      .finally(() => setLoading(false));
  }, [initialized, currentUser, farmId, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId) return;
    if (!offersPickup && !offersDelivery) {
      setError("Enable at least one option: Click & Collect or Delivery.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const { farm: updated } = await api.farms.update(farmId, {
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        location: location.trim(),
        offersPickup,
        offersDelivery,
        deliveryNotes: offersDelivery ? deliveryNotes.trim() || null : null,
      });
      setFarm(updated);
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save shop details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId) return;
    const name = categoryName.trim();
    if (!name) {
      setError("Enter a category name.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const { category } = await api.categories.create(farmId, { name });
      setCategories((prev) => [...prev, category]);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId || categories.length === 0) return;

    const price = parseFloat(productPrice);
    if (!productName.trim() || !productDescription.trim() || Number.isNaN(price) || price <= 0) {
      setError("Enter a product name, description, and valid price.");
      return;
    }
    if (!isValidImageUrl(productImage.trim())) {
      setError("Product image must be a full URL starting with https://");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await api.products.create(farmId, {
        name: productName.trim(),
        description: productDescription.trim(),
        price,
        image: productImage.trim(),
        category: categories[0].name,
      });
      await initialize();
      router.push("/farmer/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!initialized || loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="h-64 animate-pulse rounded-2xl bg-harvest-tan/40" />
      </div>
    );
  }

  if (!farm) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <p className="text-center text-sm font-semibold uppercase tracking-widest text-harvest-brown/70">
        Set up your shop
      </p>
      <h1 className="mt-2 text-center font-serif text-3xl font-bold text-harvest-green">
        {farm.name}
      </h1>
      <p className="mt-2 text-center text-harvest-brown/85">
        Three quick steps and your farm shop goes live on Local Harvest.
      </p>

      <div className="mt-8 flex justify-center gap-2">
        {STEPS.map((label, index) => (
          <div
            key={label}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              index === step
                ? "bg-harvest-green text-harvest-cream"
                : index < step
                  ? "bg-harvest-green/20 text-harvest-green-dark"
                  : "bg-harvest-tan/40 text-harvest-brown/70"
            }`}
          >
            {index + 1}. {label}
          </div>
        ))}
      </div>

      <div className="farm-panel mt-8 p-6 sm:p-8">
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        {step === 0 && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h2 className="font-serif text-xl font-semibold text-harvest-green">Tell customers about your shop</h2>
            <Field
              label="Town or area"
              value={location}
              onChange={setLocation}
              required
            />
            <Field
              label="Short description"
              value={shortDescription}
              onChange={setShortDescription}
              required
              placeholder="One line that appears on your farm card"
            />
            <Field
              label="About your farm"
              value={description}
              onChange={setDescription}
              multiline
              required
            />

            <div className="rounded-xl border border-harvest-tan/60 bg-harvest-parchment/30 p-4">
              <p className="text-sm font-semibold text-harvest-green">How customers receive orders</p>
              <div className="mt-3 space-y-2">
                <label className="flex items-center gap-2 text-sm text-harvest-brown">
                  <input
                    type="checkbox"
                    checked={offersPickup}
                    onChange={(e) => setOffersPickup(e.target.checked)}
                  />
                  Click &amp; Collect
                </label>
                <label className="flex items-center gap-2 text-sm text-harvest-brown">
                  <input
                    type="checkbox"
                    checked={offersDelivery}
                    onChange={(e) => setOffersDelivery(e.target.checked)}
                  />
                  Delivery
                </label>
              </div>
              {offersDelivery && (
                <Field
                  label="Delivery notes (optional)"
                  value={deliveryNotes}
                  onChange={setDeliveryNotes}
                  placeholder="e.g. Within 10 miles, Tue–Sat"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-harvest-green py-3 text-sm font-semibold text-harvest-brown hover:bg-harvest-green-dark hover:text-white disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Continue"}
            </button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={handleAddCategory} className="space-y-4">
            <h2 className="font-serif text-xl font-semibold text-harvest-green">Add your first category</h2>
            <p className="text-sm text-harvest-brown/80">
              Categories group your products — e.g. Vegetables, Dairy, Bakery.
            </p>
            <Field
              label="Category name"
              value={categoryName}
              onChange={setCategoryName}
              required
              placeholder="e.g. Vegetables & Produce"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-harvest-green py-3 text-sm font-semibold text-harvest-brown hover:bg-harvest-green-dark hover:text-white disabled:opacity-60"
            >
              {submitting ? "Adding..." : "Continue"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleAddProduct} className="space-y-4">
            <h2 className="font-serif text-xl font-semibold text-harvest-green">Add your first product</h2>
            <p className="text-sm text-harvest-brown/80">
              Start with one item — you can add more from your dashboard anytime.
            </p>
            <Field label="Product name" value={productName} onChange={setProductName} required />
            <Field
              label="Description"
              value={productDescription}
              onChange={setProductDescription}
              multiline
              required
            />
            <Field
              label="Price (£)"
              value={productPrice}
              onChange={setProductPrice}
              type="number"
              required
            />
            <Field
              label="Image URL"
              value={productImage}
              onChange={setProductImage}
              required
              placeholder="https://images.unsplash.com/..."
            />
            <p className="text-xs text-harvest-brown/70">
              Paste a photo link for now — proper uploads are on our roadmap.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-harvest-green py-3 text-sm font-semibold text-harvest-brown hover:bg-harvest-green-dark hover:text-white disabled:opacity-60"
            >
              {submitting ? "Publishing..." : "Publish my shop"}
            </button>
          </form>
        )}
      </div>

      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="mt-4 block w-full text-center text-sm text-harvest-brown/70 hover:text-harvest-green"
        >
          ← Back
        </button>
      )}

      <p className="mt-6 text-center text-sm text-harvest-brown/70">
        Need help?{" "}
        <a href="mailto:hello@local-harvests.co.uk" className="text-harvest-green hover:underline">
          hello@local-harvests.co.uk
        </a>
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-harvest-brown">{label}</label>
      {multiline ? (
        <textarea
          required={required}
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-harvest-tan px-4 py-2.5 outline-none focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20"
        />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-harvest-tan px-4 py-2.5 outline-none focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20"
        />
      )}
    </div>
  );
}