import type { Metadata } from "next";
import { site } from "./site";

type Opzioni = {
  /** Titolo breve: il template aggiunge " · Cultivar". Se manca vale il titolo del sito. */
  titolo?: string;
  descrizione: string;
  /** Percorso canonico, es. "/blog" */
  percorso: string;
  tipo?: "website" | "article";
  noindex?: boolean;
  articolo?: { data: string; categoria: string };
};

/** Immagine di condivisione predefinita (public/og.png, 1200×630). */
export const immagineOg = { url: "/og.png", width: 1200, height: 630, alt: site.titoloCompleto };

export function metaPagina({ titolo, descrizione, percorso, tipo = "website", noindex, articolo }: Opzioni): Metadata {
  const titoloOg = titolo ? `${titolo} · ${site.nome}` : site.titoloCompleto;
  return {
    title: titolo ?? { absolute: site.titoloCompleto },
    description: descrizione,
    alternates: { canonical: percorso },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: tipo,
      locale: site.locale,
      siteName: site.nome,
      title: titoloOg,
      description: descrizione,
      url: percorso,
      images: [immagineOg],
      ...(articolo ? { publishedTime: articolo.data, section: articolo.categoria } : {}),
    },
    twitter: { card: "summary_large_image", title: titoloOg, description: descrizione, images: [immagineOg.url] },
  };
}

/** URL assoluto a partire da un percorso. */
export const assoluto = (percorso: string) => new URL(percorso, site.url).toString();
