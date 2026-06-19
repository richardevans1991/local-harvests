"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-harvest-cream">
        <p className="font-serif text-harvest-green">Loading Local Harvest...</p>
      </div>
    );
  }

  return <>{children}</>;
}