import type { Metadata } from "next";
import { metaPagina } from "@/lib/seo";
import { getSeoPagina, getTesti } from "@/lib/dati-sito";
import { ElencoBlog } from "./ElencoBlog";

// ISR: elenco articoli dal CMS. I filtri ?categoria=… sono servite da /blog/categoria/[slug] (vedi next.config.ts)
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const [testi, seo] = await Promise.all([getTesti(), getSeoPagina("blog")]);
  return metaPagina({ titolo: "Blog", descrizione: testi.blog.intro, percorso: "/blog", seo });
}

export default function Blog() {
  return <ElencoBlog />;
}
