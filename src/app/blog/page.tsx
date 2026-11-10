import type { Metadata } from "next";
import { metaPagina } from "@/lib/seo";
import { testi } from "@/lib/testi";
import { ElencoBlog } from "./ElencoBlog";

// ISR: elenco articoli dal CMS. I filtri ?categoria=… sono servite da /blog/categoria/[slug] (vedi next.config.ts)
export const revalidate = 600;

export const metadata: Metadata = metaPagina({
  titolo: "Blog",
  descrizione: testi.blog.intro,
  percorso: "/blog",
});

export default function Blog() {
  return <ElencoBlog />;
}
