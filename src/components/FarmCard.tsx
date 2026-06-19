import Image from "next/image";
import Link from "next/link";
import type { Farm } from "@/types";

interface FarmCardProps {
  farm: Farm;
}

export default function FarmCard({ farm }: FarmCardProps) {
  return (
    <Link href={`/farms/${farm.id}`} className="farm-card group block overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={farm.image}
          alt={farm.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-harvest-brown/50 to-transparent" />
      </div>
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg font-semibold text-harvest-green group-hover:text-harvest-green-dark">
            {farm.name}
          </h3>
          <span className="shrink-0 rounded-full bg-harvest-wheat/30 px-2.5 py-0.5 text-xs font-bold text-harvest-brown">
            {farm.distance} mi
          </span>
        </div>
        <p className="mb-2 text-sm leading-relaxed text-harvest-brown/85">
          {farm.shortDescription}
        </p>
        <p className="text-xs font-semibold text-harvest-rust">📍 {farm.location}</p>
      </div>
    </Link>
  );
}