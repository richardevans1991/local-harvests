"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UserRole } from "@/types";
import { useAuthStore } from "@/stores/auth-store";

interface AuthFormProps {
  mode: "login" | "register";
  role: UserRole;
}

export default function AuthForm({ mode, role }: AuthFormProps) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isFarmer = role === "farmer";
  const title =
    mode === "login"
      ? isFarmer
        ? "Farmer Sign In"
        : "Customer Sign In"
      : isFarmer
        ? "Create Farmer Account"
        : "Create Customer Account";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result =
      mode === "login"
        ? await login(email, password, role)
        : await register(email, password, name, role);

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    router.push(
      isFarmer ? (mode === "register" ? "/farmer/plans" : "/farmer/dashboard") : "/"
    );
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-harvest-tan/50 bg-white p-8 shadow-sm">
      <h1 className="font-serif text-2xl font-bold text-harvest-green">{title}</h1>
      <p className="mt-2 text-sm text-harvest-brown/80">
        {isFarmer
          ? "Manage your farm store, products, and profile."
          : "Shop fresh produce from farms in your area."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "register" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-harvest-brown">
              Full name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-harvest-tan px-4 py-2.5 outline-none focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-harvest-brown">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-harvest-tan px-4 py-2.5 outline-none focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-harvest-brown">
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-harvest-tan px-4 py-2.5 outline-none focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-harvest-green py-3 font-medium text-harvest-brown transition hover:bg-harvest-green-dark hover:text-white disabled:opacity-60"
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-harvest-brown/80">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link
              href={isFarmer ? "/farmer/register" : "/register"}
              className="font-medium text-harvest-green hover:underline"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href={isFarmer ? "/farmer/login" : "/login"}
              className="font-medium text-harvest-green hover:underline"
            >
              Sign in
            </Link>
          </>
        )}
      </p>

      <p className="mt-3 text-center text-sm">
        {isFarmer ? (
          <Link href="/login" className="text-harvest-brown/70 hover:text-harvest-green">
            ← Customer sign in
          </Link>
        ) : (
          <Link
            href="/farmer/login"
            className="text-harvest-brown/70 hover:text-harvest-green"
          >
            Farmer sign in →
          </Link>
        )}
      </p>
    </div>
  );
}