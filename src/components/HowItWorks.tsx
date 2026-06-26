import Link from "next/link";

const steps = [
  {
    title: "Find a farm shop",
    description: "Browse local farm shops near you and discover seasonal produce.",
    icon: "🔍",
  },
  {
    title: "Order online",
    description: "Add items to your cart and choose click & collect or delivery.",
    icon: "🛒",
  },
  {
    title: "Support local growers",
    description: "Pay securely and collect fresh food direct from the farm.",
    icon: "🌾",
  },
];

interface HowItWorksProps {
  variant?: "home" | "page";
}

export default function HowItWorks({ variant = "page" }: HowItWorksProps) {
  const isHome = variant === "home";

  return (
    <section className={isHome ? "relative px-4 py-14 sm:px-6" : "px-4 py-10 sm:px-6"}>
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2
            className={
              isHome
                ? "font-serif text-2xl font-bold text-harvest-cream drop-shadow-sm sm:text-3xl"
                : "font-serif text-3xl font-bold text-harvest-green"
            }
          >
            How it works
          </h2>
          <p
            className={
              isHome
                ? "mx-auto mt-3 max-w-2xl text-harvest-cream/90"
                : "mx-auto mt-3 max-w-2xl text-harvest-brown/85"
            }
          >
            Fresh food from real farm shops — ordered in minutes.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className={
                isHome
                  ? "home-glass rounded-2xl p-6 text-center"
                  : "farm-panel p-6 text-center"
              }
            >
              <span className="text-3xl" aria-hidden>
                {step.icon}
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold text-harvest-green">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-harvest-brown/85">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {isHome && (
          <div className="mt-10 text-center">
            <Link
              href="/for-farmers"
              className="inline-block rounded-full bg-harvest-cream/90 px-6 py-3 text-sm font-semibold text-harvest-brown shadow-sm transition hover:bg-harvest-cream"
            >
              List your farm shop →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}