"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

export default function FarmerRegisterForm() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  const [name, setName] = useState("");
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [postcode, setPostcode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await register(email, password, name, "farmer", {
      farmName,
      location,
      postcode: postcode.trim() || undefined,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    router.push("/farmer/plans");
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-harvest-tan/50 bg-white p-8 shadow-sm">
      <h1 className="font-serif text-2xl font-bold text-harvest-green">Create Farmer Account</h1>
      <p className="mt-2 text-sm text-harvest-brown/80">
        Set up your account and farm shop in one step. You&apos;ll choose a plan next, then
        add your first products.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Your name" value={name} onChange={setName} required />
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
          placeholder="e.g. Walkford, New Forest"
        />
        <Field
          label="Postcode (recommended)"
          value={postcode}
          onChange={setPostcode}
          placeholder="e.g. BH24 1PA"
        />
        <Field label="Email" value={email} onChange={setEmail} type="email" required />
        <Field
          label="Password"
          value={password}
          onChange={setPassword}
          type="password"
          required
          minLength={6}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-harvest-green py-3 font-medium text-harvest-brown transition hover:bg-harvest-green-dark hover:text-white disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account & continue"}
        </button>

        <p className="text-center text-xs text-harvest-brown/70">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-harvest-green hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-harvest-green hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-harvest-brown/80">
        Already have an account?{" "}
        <Link href="/farmer/login" className="font-medium text-harvest-green hover:underline">
          Sign in
        </Link>
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
  minLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-harvest-brown">{label}</label>
      <input
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-harvest-tan px-4 py-2.5 outline-none focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20"
      />
    </div>
  );
}