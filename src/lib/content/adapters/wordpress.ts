import type { ContentSource } from "../types";
import { getArticoliWp, getArticoloWp, getCategorieWp, getDocumentariWp } from "../../wordpress";

/** Adattatore WordPress headless (REST + ACF free). Pagine e componenti non lo conoscono: usano src/lib/content. */
export const wordpressSource: ContentSource = {
  getArticoli: (opzioni) => getArticoliWp(opzioni),
  getArticolo: (slug) => getArticoloWp(slug),
  getCategorie: () => getCategorieWp(),
  getDocumentari: () => getDocumentariWp(),
};
