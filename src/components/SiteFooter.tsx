import Link from "next/link";

interface SiteFooterProps {
  variant?: "home" | "default";
}

export default function SiteFooter({ variant = "default" }: SiteFooterProps) {
  const isHome = variant === "home";

  return (
    <footer
      className={
        isHome
          ? "home-glass relative z-10 border-t border-harvest-tan/30 px-4 py-10 text-sm text-harvest-cream/90 shadow-[0_-4px_24px_rgb(0_0_0/0.08)] sm:px-6"
          : "border-t border-harvest-tan/40 bg-harvest-cream px-4 py-10 text-sm text-harvest-brown/80 sm:px-6"
      }
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:justify-between">
        <div>
          <p className="font-serif text-lg font-semibold text-inherit">
            Local Harvest
          </p>
          <p className="mt-2 max-w-xs leading-relaxed opacity-90">
            Connecting customers with local farm shops across the UK.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-inherit">Shop</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/" className="hover:underline">
                  Browse farms
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:underline">
                  My orders
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:underline">
                  How it works
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-inherit">Farmers</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/for-farmers" className="hover:underline">
                  List your farm
                </Link>
              </li>
              <li>
                <Link href="/farmer/plans" className="hover:underline">
                  Plans & pricing
                </Link>
              </li>
              <li>
                <Link href="/farmer/login" className="hover:underline">
                  Farmer login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-inherit">Contact</p>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="mailto:hello@local-harvests.co.uk" className="hover:underline">
                  hello@local-harvests.co.uk
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-6xl border-t border-current/10 pt-6 text-center text-xs opacity-75">
        © {new Date().getFullYear()} Local Harvest — Fresh food from farms near you.
      </p>
    </footer>
  );
}