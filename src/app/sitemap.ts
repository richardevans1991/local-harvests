import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppUrl();
  const farms = await prisma.farm.findMany({ select: { id: true, name: true } });

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/for-farmers`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/how-it-works`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/farmer/register`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const farmPages: MetadataRoute.Sitemap = farms.map((farm) => ({
    url: `${base}/farms/${farm.id}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...farmPages];
}