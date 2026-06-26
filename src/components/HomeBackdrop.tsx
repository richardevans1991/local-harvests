import { HOME_BACKDROP_IMAGE } from "@/lib/home-backdrop";

export default function HomeBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center"
        style={{ backgroundImage: `url(${HOME_BACKDROP_IMAGE})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-harvest-green/55 via-harvest-brown/45 to-harvest-brown/75" />
      <div className="absolute inset-0 bg-harvest-cream/10" />
    </div>
  );
}