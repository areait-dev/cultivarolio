import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategorie } from "@/lib/content";
import { metaPagina } from "@/lib/seo";
import { testi } from "@/lib/testi";
import { ElencoBlog } from "../../ElencoBlog";

/**
 * Pagina interna dei filtri del blog. Il visitatore vede e condivide /blog?categoria=slug
 * (riscrittura in next.config.ts); questa rotta resta fuori dall'indice e punta al canonical.
 */
export const revalidate = 600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCategorie()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoria = (await getCategorie()).find((c) => c.slug === slug);
  if (!categoria) return {};
  return {
    ...metaPagina({
      titolo: `Blog · ${categoria.nome}`,
      descrizione: testi.blog.intro,
      percorso: `/blog?categoria=${slug}`,
    }),
    alternates: undefined,
    robots: { index: false, follow: true },
  };
}

export default async function BlogCategoria({ params }: Props) {
  const { slug } = await params;
  const categoria = (await getCategorie()).find((c) => c.slug === slug);
  if (!categoria) notFound();
  return <ElencoBlog categoria={slug} />;
}
