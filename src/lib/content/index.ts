import "server-only";
import { cache } from "react";
import type { ContentSource } from "./types";
import { mockSource } from "./adapters/mock";
import { wordpressSource } from "./adapters/wordpress";

/**
 * Punto unico di accesso ai contenuti.
 * Sorgente: WordPress headless se NEXT_PUBLIC_WP_API_URL è impostato, altrimenti il mock
 * (sviluppo senza CMS). CMS_PROVIDER=mock|wordpress forza la scelta.
 * Pagine e componenti non vanno toccati.
 */
const sorgenti: Record<string, ContentSource> = {
  mock: mockSource,
  wordpress: wordpressSource,
};

function sorgente(): ContentSource {
  const nome = process.env.CMS_PROVIDER ?? (process.env.NEXT_PUBLIC_WP_API_URL ? "wordpress" : "mock");
  const s = sorgenti[nome];
  if (!s) throw new Error(`CMS_PROVIDER "${nome}" non configurato in src/lib/content/index.ts`);
  return s;
}

// cache() evita richieste doppie al CMS nello stesso render (es. metadata + pagina)
export const getArticoli = cache((categoria?: string, limite?: number) =>
  sorgente().getArticoli({ categoria, limite }),
);
export const getArticolo = cache((slug: string) => sorgente().getArticolo(slug));
export const getCategorie = cache(() => sorgente().getCategorie());
export const getDocumentari = cache(() => sorgente().getDocumentari());

export type * from "./types";
