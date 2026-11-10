import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Illustrazione } from "@/components/Blocchi";
import { HeroInterno } from "@/components/HeroInterno";
import { JsonLd } from "@/components/JsonLd";
import { Prosa } from "@/components/Prosa";
import { Pulsante } from "@/components/Pulsante";
import { LinkTesto, Sezione } from "@/components/Sezione";
import { Meta } from "@/components/Testo";
import { getArticolo, getArticoli } from "@/lib/content";
import { formattaData } from "@/lib/format";
import { assoluto, metaPagina } from "@/lib/seo";
import { site } from "@/lib/site";
import s from "../blog.module.css";

// ISR: gli articoli nuovi compaiono alla prima visita (dynamicParams) e si aggiornano ogni ora
export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getArticoli()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticolo(slug);
  if (!a) return {};
  return {
    ...metaPagina({
      titolo: a.seo?.titolo ?? a.titolo,
      descrizione: a.seo?.descrizione ?? a.estratto,
      percorso: `/blog/${a.slug}`,
      tipo: "article",
      articolo: { data: a.data, categoria: a.categoria.nome },
    }),
  };
}

export default async function Articolo({ params }: Props) {
  const { slug } = await params;
  const a = await getArticolo(slug);
  if (!a) notFound();

  const dati = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.titolo,
    description: a.estratto,
    datePublished: a.data,
    articleSection: a.categoria.nome,
    inLanguage: "it",
    mainEntityOfPage: assoluto(`/blog/${a.slug}`),
    ...(a.copertina ? { image: [assoluto(a.copertina.src)] } : { image: [assoluto("/og.png")] }),
    author: { "@type": "Organization", name: site.titolare.ragioneSociale },
    publisher: { "@type": "Organization", name: site.titolare.ragioneSociale, url: site.url },
  };

  return (
    <>
      <JsonLd dati={dati} />
      <HeroInterno
        tono="kraft"
        stretto
        occhiello={
          <span className={s.occhiello}>
            <Link href="/blog">Blog</Link> · {a.categoria.nome}
          </span>
        }
        titolo={a.titolo}
      >
        <Meta>
          <time dateTime={a.data}>{formattaData(a.data)}</time> · {a.minutiLettura} minuti di lettura
        </Meta>
      </HeroInterno>

      <Sezione className={s.corpoArticolo}>
        <Prosa blocchi={a.corpo} />
        <div className={s.chiusura}>
          <Illustrazione src={a.illustrazione ?? "/illustrazioni/foglie-carbone.svg"} larghezza={220} />
        </div>
        <div className={s.piede}>
          <LinkTesto href="/blog" indietro>
            Tutti gli articoli
          </LinkTesto>
          <Pulsante href="/documentari">
            Guarda i documentari
          </Pulsante>
        </div>
      </Sezione>
    </>
  );
}
