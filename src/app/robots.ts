import type { MetadataRoute } from "next";
import { inCostruzione } from "@/lib/costruzione";
import { assoluto } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (inCostruzione) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: assoluto("/sitemap.xml"),
  };
}
