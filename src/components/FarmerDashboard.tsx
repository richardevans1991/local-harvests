"use client";

import SafeImage from "@/components/SafeImage";
import { isValidImageUrl } from "@/lib/image-utils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Farm, FarmCategory, Product } from "@/types";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

export default function FarmerDashboard() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const initialized = useAuthStore((s) => s.initialized);

  const [farm, setFarm] = useState<Farm | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<FarmCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [farmName, setFarmName] = useState("");
  const [farmDescription, setFarmDescription] = useState("");
  const [farmShortDescription, setFarmShortDescription] = useState("");
  const [farmBanner, setFarmBanner] = useState("");
  const [farmImage, setFarmImage] = useState("");
  const [offersPickup, setOffersPickup] = useState(true);
  const [offersDelivery, setOffersDelivery] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [productSaved, setProductSaved] = useState(false);
  const [categorySaved, setCategorySaved] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const categoryNames = useMemo(() => categories.map((c) => c.name).sort(), [categories]);

  const farmId = currentUser?.farmId;

  const loadFarmData = async (id: string) => {
    const { farm, products, categories: loadedCategories } = await api.farms.get(id);
    setFarm(farm);
    setProducts(products);
    setCategories(loadedCategories);
    if (!productCategory && loadedCategories.length > 0) {
      setProductCategory(loadedCategories[0].name);
    }
    setFarmName(farm.name);
    setFarmDescription(farm.description);
    setFarmShortDescription(farm.shortDescription);
    setFarmBanner(farm.banner);
    setFarmImage(farm.image);
    setOffersPickup(farm.offersPickup);
    setOffersDelivery(farm.offersDelivery);
    setDeliveryNotes(farm.deliveryNotes ?? "");
  };

  useEffect(() => {
    if (!initialized) return;
    if (!currentUser || currentUser.role !== "farmer") {
      router.replace("/farmer/login");
      return;
    }
    if (!farmId) {
      setLoading(false);
      return;
    }
    loadFarmData(farmId)
      .catch(() => setError("Failed to load farm data."))
      .finally(() => setLoading(false));
  }, [initialized, currentUser, farmId, router]);

  if (!initialized || loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="h-48 animate-pulse rounded-2xl bg-harvest-tan/40" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "farmer") {
    return null;
  }

  if (!farmId || !farm) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold text-harvest-green">
          No farm linked to your account
        </h1>
        <p className="mt-2 text-harvest-brown">
          Use a demo farmer account to manage an existing store.
        </p>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    if (!offersPickup && !offersDelivery) {
      setError("Enable at least one option: Click & Collect or Delivery.");
      return;
    }

    try {
      const { farm: updated } = await api.farms.update(farmId, {
        name: farmName,
        description: farmDescription,
        shortDescription: farmShortDescription,
        banner: farmBanner,
        image: farmImage,
        offersPickup,
        offersDelivery,
        deliveryNotes: offersDelivery ? deliveryNotes.trim() || null : null,
      });
      setFarm(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    }
  };

  const resetProductForm = () => {
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductImage("");
    setProductCategory(categories[0]?.name ?? "");
    setEditingId(null);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const name = newCategoryName.trim();
    if (!name) {
      setError("Enter a category name.");
      return;
    }

    setCategorySubmitting(true);
    try {
      const { category } = await api.categories.create(farmId, name);
      setCategories((prev) => [...prev, category].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName("");
      if (!productCategory) setProductCategory(category.name);
      setCategorySaved(true);
      setTimeout(() => setCategorySaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add category.");
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleUpdateCategory = async (categoryId: string) => {
    setError("");
    const name = editingCategoryName.trim();
    if (!name) {
      setError("Category name cannot be empty.");
      return;
    }

    setCategorySubmitting(true);
    try {
      const { category } = await api.categories.update(categoryId, name);
      setCategories((prev) =>
        prev
          .map((c) => (c.id === categoryId ? category : c))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setProducts((prev) =>
        prev.map((p) =>
          p.category === categories.find((c) => c.id === categoryId)?.name
            ? { ...p, category: category.name }
            : p
        )
      );
      if (productCategory === categories.find((c) => c.id === categoryId)?.name) {
        setProductCategory(category.name);
      }
      setEditingCategoryId(null);
      setEditingCategoryName("");
      setCategorySaved(true);
      setTimeout(() => setCategorySaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category.");
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleRemoveCategory = async (categoryId: string) => {
    setError("");
    const removed = categories.find((c) => c.id === categoryId);
    try {
      await api.categories.remove(categoryId);
      const remaining = categories.filter((c) => c.id !== categoryId);
      setCategories(remaining);
      if (removed && productCategory === removed.name) {
        setProductCategory(remaining[0]?.name ?? "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove category.");
    }
  };

  const startEditCategory = (category: FarmCategory) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const price = parseFloat(productPrice);
    const category = productCategory.trim();

    if (!productName.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!productDescription.trim()) {
      setError("Product description is required.");
      return;
    }
    if (isNaN(price) || price <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }
    if (!productImage.trim()) {
      setError("Product image URL is required.");
      return;
    }
    if (!isValidImageUrl(productImage)) {
      setError("Image must be a full URL starting with https:// (e.g. an Unsplash link).");
      return;
    }
    if (!category) {
      setError("Choose a category. Add one in Shop Categories first.");
      return;
    }
    if (!categoryNames.includes(category)) {
      setError(`Add "${category}" as a shop category before using it on a product.`);
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const { product } = await api.products.update(editingId, {
          name: productName.trim(),
          description: productDescription.trim(),
          price,
          image: productImage.trim(),
          category,
        });
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? product : p))
        );
      } else {
        const { product } = await api.products.create(farmId, {
          name: productName.trim(),
          description: productDescription.trim(),
          price,
          image: productImage.trim(),
          category,
        });
        setProducts((prev) => [...prev, product]);
      }
      resetProductForm();
      setProductSaved(true);
      setTimeout(() => setProductSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setEditingId(productId);
    setProductName(product.name);
    setProductDescription(product.description);
    setProductPrice(product.price.toString());
    setProductImage(product.image);
    setProductCategory(product.category);
  };

  const handleRemove = async (productId: string) => {
    try {
      await api.products.remove(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove product.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-harvest-green">
            Farmer Dashboard
          </h1>
          <p className="mt-1 text-harvest-brown">Welcome back, {currentUser.name}</p>
        </div>
        <a
          href={`/farms/${farmId}`}
          className="rounded-full border border-harvest-green px-4 py-2 text-sm font-medium text-harvest-green transition hover:bg-harvest-green hover:text-white"
        >
          View your store →
        </a>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="farm-panel p-6">
          <h2 className="font-serif text-xl font-semibold text-harvest-green">
            Farm Profile
          </h2>
          <div className="mt-4 space-y-4">
            <Field label="Farm name" value={farmName} onChange={setFarmName} />
            <Field
              label="Short description"
              value={farmShortDescription}
              onChange={setFarmShortDescription}
            />
            <Field
              label="Full description"
              value={farmDescription}
              onChange={setFarmDescription}
              multiline
            />
            <Field label="Card image URL" value={farmImage} onChange={setFarmImage} />
            <Field label="Banner image URL" value={farmBanner} onChange={setFarmBanner} />

            <div className="rounded-xl border border-harvest-tan/60 bg-harvest-parchment/30 p-4">
              <h3 className="text-sm font-semibold text-harvest-green">
                How customers get their order
              </h3>
              <p className="mt-1 text-xs text-harvest-brown/80">
                Choose what your farm offers. Disabled options won&apos;t appear at checkout.
              </p>
              <div className="mt-4 space-y-3">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={offersPickup}
                    onChange={(e) => setOffersPickup(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-harvest-tan text-harvest-green focus:ring-harvest-green"
                  />
                  <span>
                    <span className="block text-sm font-medium text-harvest-brown">
                      Click &amp; Collect
                    </span>
                    <span className="block text-xs text-harvest-brown/70">
                      Customers pick up at your farm shop
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={offersDelivery}
                    onChange={(e) => setOffersDelivery(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-harvest-tan text-harvest-green focus:ring-harvest-green"
                  />
                  <span>
                    <span className="block text-sm font-medium text-harvest-brown">
                      Delivery
                    </span>
                    <span className="block text-xs text-harvest-brown/70">
                      You deliver to the customer&apos;s address
                    </span>
                  </span>
                </label>
              </div>
              {offersDelivery && (
                <div className="mt-4">
                  <Field
                    label="Delivery notes (optional)"
                    value={deliveryNotes}
                    onChange={setDeliveryNotes}
                    multiline
                    placeholder="e.g. Local delivery within 10 miles, Wed–Sat mornings"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleSaveProfile}
              className="rounded-full bg-harvest-green px-6 py-2.5 text-sm font-medium text-harvest-brown transition hover:bg-harvest-green-dark hover:text-white"
            >
              {saved ? "Saved!" : "Save profile"}
            </button>
          </div>
        </section>

        <section className="farm-panel p-6">
          <h2 className="font-serif text-xl font-semibold text-harvest-green">
            {editingId ? "Edit Product" : "Add Product"}
          </h2>
          <p className="mt-1 text-sm text-harvest-brown/80">
            Choose a category from your shop categories.
          </p>
          <form onSubmit={handleProductSubmit} className="mt-4 space-y-4">
            <Field label="Product name" value={productName} onChange={setProductName} required />
            <Field
              label="Description"
              value={productDescription}
              onChange={setProductDescription}
              multiline
              required
            />
            <Field label="Price ($)" value={productPrice} onChange={setProductPrice} type="number" required />
            <Field
              label="Image URL"
              value={productImage}
              onChange={setProductImage}
              required
              placeholder="https://images.unsplash.com/photo-..."
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-harvest-brown">
                Category
              </label>
              <select
                required
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                disabled={categories.length === 0}
                className="w-full rounded-lg border border-harvest-tan px-4 py-2.5 outline-none focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20 disabled:bg-harvest-parchment/50"
              >
                {categories.length === 0 ? (
                  <option value="">Add a shop category first</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="farm-btn-primary px-6 py-2.5 text-sm disabled:opacity-60"
              >
                {submitting
                  ? "Saving..."
                  : productSaved
                    ? "✓ Saved!"
                    : editingId
                      ? "Update product"
                      : "Add product"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="rounded-full border border-harvest-tan px-6 py-2.5 text-sm text-harvest-brown"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      </div>

      <section className="farm-panel mt-8 p-6">
        <h2 className="font-serif text-xl font-semibold text-harvest-green">
          Shop Categories
        </h2>
        <p className="mt-1 text-sm text-harvest-brown/80">
          Add the categories customers will browse in your shop (e.g. Preserves, Flowers).
        </p>
        <form onSubmit={handleAddCategory} className="mt-4 flex flex-wrap gap-3">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            className="min-w-0 flex-1 rounded-lg border border-harvest-tan px-4 py-2.5 outline-none focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20"
          />
          <button
            type="submit"
            disabled={categorySubmitting}
            className="farm-btn-primary px-5 py-2.5 text-sm disabled:opacity-60"
          >
            {categorySubmitting ? "Adding..." : categorySaved ? "✓ Added!" : "Add category"}
          </button>
        </form>
        {categories.length === 0 ? (
          <p className="mt-4 text-sm text-harvest-brown/80">
            No categories yet. Add your first above before adding products.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-harvest-tan/40">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                {editingCategoryId === category.id ? (
                  <>
                    <input
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-harvest-tan px-3 py-2 text-sm outline-none focus:border-harvest-green"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateCategory(category.id)}
                      disabled={categorySubmitting}
                      className="rounded-full bg-harvest-green px-3 py-1.5 text-sm text-harvest-brown"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryId(null);
                        setEditingCategoryName("");
                      }}
                      className="rounded-full border border-harvest-tan px-3 py-1.5 text-sm text-harvest-brown"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-harvest-green">{category.name}</span>
                    <span className="text-xs text-harvest-brown/60">
                      {products.filter((p) => p.category === category.name).length} product(s)
                    </span>
                    <button
                      type="button"
                      onClick={() => startEditCategory(category)}
                      className="rounded-full border border-harvest-tan px-3 py-1.5 text-sm text-harvest-brown hover:border-harvest-green hover:text-harvest-green"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(category.id)}
                      className="rounded-full border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="farm-panel mt-8 p-6">
        <h2 className="font-serif text-xl font-semibold text-harvest-green">
          Your Products ({products.length})
        </h2>
        {products.length === 0 ? (
          <p className="mt-4 text-harvest-brown">No products yet. Add your first above.</p>
        ) : (
          <div className="mt-4 divide-y divide-harvest-tan/40">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                  <SafeImage
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-harvest-green">{product.name}</p>
                  <p className="text-sm text-harvest-brown/80">
                    {product.category} · ${product.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(product.id)}
                    className="rounded-full border border-harvest-tan px-3 py-1.5 text-sm text-harvest-brown hover:border-harvest-green hover:text-harvest-green"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="rounded-full border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const className =
    "w-full rounded-lg border border-harvest-tan px-4 py-2.5 outline-none focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20";

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-harvest-brown">
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={3}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          step={type === "number" ? "0.01" : undefined}
          min={type === "number" ? "0.01" : undefined}
        />
      )}
    </div>
  );
}