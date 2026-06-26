import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-6 sm:px-6 sm:pb-12 sm:pt-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-harvest-brown/35 via-harvest-brown/10 to-transparent sm:h-[32rem]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="hero-logo-wrap mx-auto w-fit">
          <Image
            src="/logos/logo.jpg"
            alt="Local Harvest"
            width={480}
            height={140}
            className="hero-logo-blend h-20 w-auto sm:h-28 md:h-36"
            priority
          />
        </div>

        <p className="hero-eyebrow mt-8 inline-block rounded-full border border-harvest-cream/35 bg-harvest-cream/15 px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-harvest-cream backdrop-blur-sm">
          🌾 Your neighborhood farm marketplace
        </p>

        <h1 className="hero-heading mt-5 font-serif text-4xl font-bold leading-tight text-harvest-cream sm:text-5xl md:text-6xl">
          Fresh food from farms near you
        </h1>

        <p className="hero-subheading mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-harvest-cream/95 sm:text-xl">
          Discover local farm shops, browse seasonal produce, and support the
          growers in your community.
        </p>
      </div>
    </section>
  );
}