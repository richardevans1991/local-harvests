"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FALLBACK_IMAGE, normalizeImageUrl } from "@/lib/image-utils";

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export default function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: SafeImageProps) {
  const [safeSrc, setSafeSrc] = useState(() => normalizeImageUrl(src));

  useEffect(() => {
    setSafeSrc(normalizeImageUrl(src));
  }, [src]);

  const handleError = () => {
    setSafeSrc((current) => (current === FALLBACK_IMAGE ? current : FALLBACK_IMAGE));
  };

  if (fill) {
    return (
      <Image
        src={safeSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={handleError}
    />
  );
}