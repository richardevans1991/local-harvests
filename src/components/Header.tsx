"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { selectCartItemCount, useCartStore } from "@/stores/cart-store";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const itemCount = useCartStore(selectCartItemCount);

  const navLinkClass = isHome
    ? "font-medium text-harvest-cream/95 drop-shadow-sm transition hover:text-white"
    : "font-medium text-harvest-brown transition hover:text-harvest-green";

  const cartClass = isHome
    ? "relative rounded-full border border-harvest-cream/40 bg-harvest-cream/15 px-4 py-2 font-medium text-harvest-cream backdrop-blur-sm transition hover:border-harvest-cream hover:bg-harvest-cream/25"
    : "relative rounded-full border border-harvest-wheat/70 bg-white/70 px-4 py-2 font-medium text-harvest-brown transition hover:border-harvest-green hover:text-harvest-green";

  const outlineBtnClass = isHome
    ? "rounded-full border border-harvest-cream/40 px-3 py-1.5 text-harvest-cream backdrop-blur-sm transition hover:border-harvest-cream hover:bg-harvest-cream/15"
    : "rounded-full border border-harvest-wheat px-3 py-1.5 text-harvest-brown transition hover:border-harvest-green hover:text-harvest-green";

  const farmerBtnClass = isHome
    ? "hidden rounded-full bg-harvest-cream/90 px-4 py-2 font-medium text-harvest-brown shadow-sm transition hover:bg-harvest-cream sm:inline-block"
    : "hidden rounded-full bg-harvest-green px-4 py-2 font-medium text-harvest-brown shadow-sm transition hover:bg-harvest-green-dark hover:text-white sm:inline-block";

  return (
    <header
      className={
        isHome
          ? "sticky top-0 z-50 border-b border-harvest-cream/15 bg-harvest-brown/25 shadow-sm backdrop-blur-md"
          : "sticky top-0 z-50 border-b border-harvest-wheat/60 bg-harvest-cream/95 shadow-sm backdrop-blur-sm"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-3.5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <Image
            src={isHome ? "/logos/logo-icon-light.png" : "/logos/logo-icon-mark.png"}
            alt=""
            width={140}
            height={140}
            className={
              isHome
                ? "h-11 w-auto drop-shadow-sm sm:h-12"
                : "h-10 w-auto sm:h-11"
            }
            priority
            aria-hidden
          />
          <span
            className={
              isHome
                ? "font-serif text-xl font-bold leading-none text-harvest-cream drop-shadow-sm sm:text-2xl"
                : "font-serif text-xl font-bold leading-none text-harvest-green-dark sm:text-2xl"
            }
          >
            Local Harvest
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-sm sm:gap-5">
          <Link href="/" className={`hidden sm:inline ${navLinkClass}`}>
            Farms
          </Link>

          <Link href="/cart" className={cartClass}>
            🛒 Cart
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-harvest-rust px-1 text-xs font-bold text-white shadow">
                {itemCount}
              </span>
            )}
          </Link>

          {currentUser ? (
            <>
              {currentUser.role === "farmer" && (
                <>
                  <Link href="/farmer/plans" className={`hidden sm:inline ${navLinkClass}`}>
                    Plans
                  </Link>
                  {currentUser.farmId && (
                    <Link href="/farmer/dashboard" className={navLinkClass}>
                      Dashboard
                    </Link>
                  )}
                </>
              )}
              <button onClick={() => logout()} className={outlineBtnClass}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClass}>
                Sign in
              </Link>
              <Link href="/farmer/login" className={farmerBtnClass}>
                Farmer login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}