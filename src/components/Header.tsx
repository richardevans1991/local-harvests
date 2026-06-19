"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { selectCartItemCount, useCartStore } from "@/stores/cart-store";

export default function Header() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const itemCount = useCartStore(selectCartItemCount);

  return (
    <header className="sticky top-0 z-50 border-b border-harvest-wheat/60 bg-harvest-cream/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logos/logo.jpg"
            alt="Local Harvest"
            width={200}
            height={56}
            className="h-11 w-auto object-contain sm:h-12"
            priority
          />
        </Link>

        <nav className="flex items-center gap-3 text-sm sm:gap-5">
          <Link
            href="/"
            className="hidden font-medium text-harvest-brown hover:text-harvest-green sm:inline"
          >
            Farms
          </Link>

          <Link
            href="/cart"
            className="relative rounded-full border border-harvest-wheat/70 bg-white/70 px-4 py-2 font-medium text-harvest-brown transition hover:border-harvest-green hover:text-harvest-green"
          >
            🛒 Cart
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-harvest-rust px-1 text-xs font-bold text-white shadow">
                {itemCount}
              </span>
            )}
          </Link>

          {currentUser ? (
            <>
              {currentUser.role === "farmer" && currentUser.farmId && (
                <Link
                  href="/farmer/dashboard"
                  className="font-medium text-harvest-brown hover:text-harvest-green"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => logout()}
                className="rounded-full border border-harvest-wheat px-3 py-1.5 text-harvest-brown transition hover:border-harvest-green hover:text-harvest-green"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-medium text-harvest-brown hover:text-harvest-green"
              >
                Sign in
              </Link>
              <Link
                href="/farmer/login"
                className="hidden rounded-full bg-harvest-green px-4 py-2 font-medium text-harvest-brown shadow-sm transition hover:bg-harvest-green-dark hover:text-white sm:inline-block"
              >
                Farmer login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}