import Link from "next/link";

interface SiteFooterProps {
  variant?: "home" | "default";
}

export default function SiteFooter({ variant = "default" }: SiteFooterProps) {
  const isHome = variant === "home";

  const linkClass = isHome
    ? "text-harvest-brown/90 transition hover:text-harvest-green hover:underline"
    : "hover:underline";

  return (
    <footer
      className={
        isHome
          ? "home-footer relative z-10 border-t border-harvest-tan/50 px-4 py-10 text-sm text-harvest-brown shadow-[0_-4px_24px_rgb(30_20_10/0.12)] sm:px-6"
          : "border-t border-harvest-tan/40 bg-harvest-cream px-4 py-10 text-sm text-harvest-brown/80 sm:px-6"
      }
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:justify-between">
        <div>
          <p
            className={
              isHome
                ? "font-serif text-lg font-semibold text-harvest-green-dark"
                : "font-serif text-lg font-semibold text-inherit"
            }
          >
            Local Harvest
          </p>
          <p className="mt-2 max-w-xs leading-relaxed text-harvest-brown/85">
            Connecting customers with local farm shops across the UK.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p
              className={
                isHome ? "font-semibold text-harvest-green-dark" : "font-semibold text-inherit"
              }
            >
              Shop
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/" className={linkClass}>
                  Browse farms
                </Link>
              </li>
              <li>
                <Link href="/orders" className={linkClass}>
                  My orders
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className={linkClass}>
                  How it works
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p
              className={
                isHome ? "font-semibold text-harvest-green-dark" : "font-semibold text-inherit"
              }
            >
              Farmers
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/for-farmers" className={linkClass}>
                  List your farm
                </Link>
              </li>
              <li>
                <Link href="/farmer/plans" className={linkClass}>
                  Plans & pricing
                </Link>
              </li>
              <li>
                <Link href="/farmer/login" className={linkClass}>
                  Farmer login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p
              className={
                isHome ? "font-semibold text-harvest-green-dark" : "font-semibold text-inherit"
              }
            >
              Contact
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="mailto:hello@local-harvests.co.uk" className={linkClass}>
                  hello@local-harvests.co.uk
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p
        className={
          isHome
            ? "mx-auto mt-8 max-w-6xl border-t border-harvest-tan/50 pt-6 text-center text-xs text-harvest-brown/70"
            : "mx-auto mt-8 max-w-6xl border-t border-current/10 pt-6 text-center text-xs opacity-75"
        }
      >
        © {new Date().getFullYear()} Local Harvest — Fresh food from farms near you.
      </p>
    </footer>
  );
}