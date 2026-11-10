import type { MetadataRoute } from "next";
import { getArticoli } from "@/lib/content";
import { assoluto } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articoli = await getArticoli();
  const fisse: MetadataRoute.Sitemap = [
    { url: assoluto("/"), changeFrequency: "monthly", priority: 1 },
    { url: assoluto("/il-progetto"), changeFrequency: "yearly", priority: 0.8 },
    { url: assoluto("/documentari"), changeFrequency: "monthly", priority: 0.9 },
    { url: assoluto("/blog"), changeFrequency: "weekly", priority: 0.8 },
    { url: assoluto("/contatti"), changeFrequency: "yearly", priority: 0.5 },
    { url: assoluto("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: assoluto("/cookie"), changeFrequency: "yearly", priority: 0.2 },
  ];
  return [
    ...fisse,
    ...articoli.map((a) => ({
      url: assoluto(`/blog/${a.slug}`),
      lastModified: a.data,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
