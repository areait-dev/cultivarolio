import type { Metadata } from "next";
import { getImmagineOg, getSito } from "./dati-sito";
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
  /**
   * Titolo e descrizione impostati in Yoast (yoast_head_json). Se presenti hanno la precedenza:
   * il titolo Yoast è già completo (con il nome del sito), quindi si usa così com'è.
   */
  seo?: { titolo?: string; descrizione?: string };
};

/** Immagine di condivisione predefinita (public/og.png, 1200×630), se in WordPress non ne è scelta un'altra. */
const OG_DEFAULT = { url: "/og.png", width: 1200, height: 630 };

export async function metaPagina({
  titolo,
  descrizione,
  percorso,
  tipo = "website",
  noindex,
  articolo,
  seo,
}: Opzioni): Promise<Metadata> {
  const [sito, og] = await Promise.all([getSito(), getImmagineOg()]);
  const immagine = {
    ...(og ? { url: og.src, width: og.larghezza, height: og.altezza } : OG_DEFAULT),
    alt: sito.titoloCompleto,
  };
  const titoloOg = seo?.titolo ?? (titolo ? `${titolo} · ${sito.nome}` : sito.titoloCompleto);
  const testo = seo?.descrizione ?? descrizione;
  return {
    title: seo?.titolo ? { absolute: seo.titolo } : (titolo ?? { absolute: sito.titoloCompleto }),
    description: testo,
    alternates: { canonical: percorso },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: tipo,
      locale: site.locale,
      siteName: sito.nome,
      title: titoloOg,
      description: testo,
      url: percorso,
      images: [immagine],
      ...(articolo ? { publishedTime: articolo.data, section: articolo.categoria } : {}),
    },
    twitter: { card: "summary_large_image", title: titoloOg, description: testo, images: [immagine.url] },
  };
}

/** URL assoluto a partire da un percorso. */
export const assoluto = (percorso: string) => new URL(percorso, site.url).toString();
