export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-harvest-green-light px-4 py-16 sm:px-6 sm:py-24">
      <div className="absolute inset-0 opacity-35">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&h=600&fit=crop)",
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-harvest-green-light/70 to-harvest-green/50" />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="mb-3 inline-block rounded-full border border-harvest-green/30 bg-harvest-cream/80 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-harvest-brown">
          🌾 Your neighborhood farm marketplace
        </p>
        <h1 className="font-serif text-4xl font-bold leading-tight text-harvest-green-dark sm:text-5xl">
          Fresh food from farms near you
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-harvest-brown/85">
          Discover local farm shops, browse seasonal produce, and support the
          growers in your community.
        </p>
      </div>
    </section>
  );
}