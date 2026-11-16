/**
 * Mappa tra contenuti WordPress e percorsi pubblici del sito.
 * Un solo posto: lo usano /api/revalidate e /api/preview (il mu-plugin headless-redirect.php
 * ha la stessa mappa per i redirect 301: se cambi una pagina, aggiorna anche lì).
 */

/** slug della pagina WordPress → percorso pubblico */
export const PAGINE_PUBBLICHE: Record<string, string> = {
  home: "/",
  "il-progetto": "/il-progetto",
  documentari: "/documentari",
  blog: "/blog",
  contatti: "/contatti",
  privacy: "/privacy",
  cookie: "/cookie",
};

export const SLUG_OPZIONI_GLOBALI = "opzioni-globali";

export type PercorsoDaRigenerare = { percorso: string; tipo?: "page" | "layout" };

/** Percorsi da rigenerare quando cambia un contenuto. Vuoto se il tipo/slug non è noto. */
export function percorsiDaRigenerare(postType: string, slug: string): PercorsoDaRigenerare[] {
  switch (postType) {
    case "articolo":
      return [
        { percorso: "/" },
        { percorso: "/blog" },
        { percorso: `/blog/${slug}` },
        { percorso: "/blog/categoria/[slug]", tipo: "page" },
        { percorso: "/sitemap.xml" },
      ];
    case "documentario":
      // i documentari compaiono anche in home e nei "territori" de Il progetto
      return [{ percorso: "/" }, { percorso: "/documentari" }, { percorso: "/il-progetto" }];
    case "page":
      if (slug === SLUG_OPZIONI_GLOBALI) return [{ percorso: "/", tipo: "layout" }];
      return PAGINE_PUBBLICHE[slug] ? [{ percorso: PAGINE_PUBBLICHE[slug] }] : [];
    default:
      return [];
  }
}

/** Percorso da aprire in anteprima. Null se non si sa dove mostrarlo. */
export function percorsoAnteprima(postType: string, slug: string): string | null {
  switch (postType) {
    case "articolo":
      return slug ? `/blog/${encodeURIComponent(slug)}` : null;
    case "documentario":
      return slug ? `/documentari#${encodeURIComponent(slug)}` : "/documentari";
    case "page":
      return slug === SLUG_OPZIONI_GLOBALI ? "/" : (PAGINE_PUBBLICHE[slug] ?? null);
    default:
      return null;
  }
}
