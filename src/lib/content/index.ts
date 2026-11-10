import "server-only";
import { cache } from "react";
import type { ContentSource } from "./types";
import { mockSource } from "./adapters/mock";

/**
 * Punto unico di accesso ai contenuti.
 * Per collegare il CMS: crea src/lib/content/adapters/<cms>.ts che implementa
 * ContentSource, aggiungilo a `sorgenti` e imposta CMS_PROVIDER=<cms>.
 * Pagine e componenti non vanno toccati.
 */
const sorgenti: Record<string, ContentSource> = {
  mock: mockSource,
  // sanity: sanitySource,
  // strapi: strapiSource,
  // wordpress: wordpressSource,
};

function sorgente(): ContentSource {
  const nome = process.env.CMS_PROVIDER ?? "mock";
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
