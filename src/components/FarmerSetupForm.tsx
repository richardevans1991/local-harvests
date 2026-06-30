"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

export default function FarmerSetupForm() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const initialized = useAuthStore((s) => s.initialized);
  const initialize = useAuthStore((s) => s.initialize);

  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!initialized) return;
    if (!currentUser || currentUser.role !== "farmer") {
      router.replace("/farmer/login");
      return;
    }

    if (currentUser.farmId) {
      router.replace("/farmer/onboarding");
      return;
    }

    api.farmer.farm
      .get()
      .then(({ farm }) => {
        if (farm) {
          router.replace("/farmer/onboarding");
        }
      })
      .finally(() => setChecking(false));
  }, [initialized, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.farmer.farm.create({ farmName, location });
      await initialize();
      const { subscription } = await api.farmer.subscription.get();
      router.push(
        subscription.needsPlanSelection ? "/farmer/plans" : "/farmer/onboarding"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create your shop.");
    } finally {
      setLoading(false);
    }
  };

  if (!initialized || checking) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="h-64 animate-pulse rounded-2xl bg-harvest-tan/40" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-harvest-tan/50 bg-white p-8 shadow-sm">
      <h1 className="font-serif text-2xl font-bold text-harvest-green">Create your farm shop</h1>
      <p className="mt-2 text-sm text-harvest-brown/80">
        Your account is ready — add your shop details to continue.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field
          label="Farm shop name"
          value={farmName}
          onChange={setFarmName}
          required
          placeholder="e.g. Green Meadow Farm Shop"
        />
        <Field
          label="Town or area"
          value={location}
          onChange={setLocation}
          required
          placeholder="e.g. North Yorkshire"
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-harvest-green py-3 font-medium text-harvest-brown transition hover:bg-harvest-green-dark hover:text-white disabled:opacity-60"
        >
          {loading ? "Creating shop..." : "Continue"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-harvest-brown">{label}</label>
      <input
        type="text"
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-harvest-tan px-4 py-2.5 outline-none focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20"
      />
    </div>
  );
}