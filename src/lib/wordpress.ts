import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import { parse } from "node-html-parser";
import type { Articolo, ArticoloSintesi, Categoria, Documentario, Immagine } from "./content/types";
import { htmlToBlocchi } from "./html-blocchi";

/**
 * Client di WordPress headless (REST nativa /wp-json/wp/v2, ACF free, Yoast).
 *
 * Regole:
 * - ogni funzione ha un fallback sicuro (null / lista vuota) se WordPress non risponde:
 *   il build non si rompe, la pagina usa i testi di riserva e riprova alla revalidazione;
 * - `next: { revalidate }` è solo la rete di sicurezza ISR: l'aggiornamento vero arriva
 *   dal webhook /api/revalidate chiamato dal mu-plugin;
 * - in draftMode (anteprima) si legge con Application Password, status=any e senza cache.
 *
 * NEXT_PUBLIC_WP_API_URL = base della REST, es. https://wp.cultivarolio.it/wp-json/wp/v2
 */

const BASE = process.env.NEXT_PUBLIC_WP_API_URL?.replace(/\/+$/, "");
const REVALIDATE = 3600;
const TIMEOUT_MS = 8000;

export const wpConfigurato = () => Boolean(BASE);

// ---------------------------------------------------------------------------
// Tipi della risposta REST (solo ciò che serve)
// ---------------------------------------------------------------------------

export type WpRendered = { rendered: string };
export type WpAcfImmagine = { url: string; alt?: string; width?: number; height?: number };
export type WpMedia = {
  source_url: string;
  alt_text?: string;
  media_details?: { width?: number; height?: number };
};
export type WpTermine = { id: number; slug: string; name: string; taxonomy?: string };
export type WpYoast = { title?: string; description?: string };
export type WpAcf = Record<string, unknown>;

type WpBase = {
  id: number;
  slug: string;
  date: string;
  title: WpRendered;
  menu_order?: number;
  /** ACF restituisce [] quando il post non ha campi */
  acf?: WpAcf | unknown[];
  yoast_head_json?: WpYoast | null;
};

export type WpArticolo = WpBase & {
  excerpt: WpRendered;
  content: WpRendered;
  _embedded?: {
    "wp:featuredmedia"?: WpMedia[];
    "wp:term"?: WpTermine[][];
  };
};
export type WpDocumentario = WpBase;
export type WpPagina = WpBase & { content: WpRendered };

// ---------------------------------------------------------------------------
// Utilità di normalizzazione
// ---------------------------------------------------------------------------

/** Campi ACF come oggetto (ACF manda [] quando non c'è nulla). */
export function acfDi(post?: { acf?: WpAcf | unknown[] } | null): WpAcf {
  const a = post?.acf;
  return a && !Array.isArray(a) && typeof a === "object" ? a : {};
}

/** Stringa non vuota oppure undefined (ACF manda false / "" per i campi vuoti). */
export function stringa(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

/** Sotto-oggetto di un campo group ACF. */
export function gruppo(v: unknown): WpAcf {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as WpAcf) : {};
}

/** Testo semplice da HTML (titoli ed estratti arrivano con entità e tag). */
export function testoPulito(html?: string): string {
  if (!html) return "";
  return parse(html).textContent.replace(/\s+/g, " ").trim();
}

/** Immagine ACF (return_format "array") → Immagine del sito. */
export function immagineAcf(v: unknown): Immagine | undefined {
  if (!v || typeof v !== "object") return undefined;
  const i = v as WpAcfImmagine;
  if (typeof i.url !== "string" || !i.url) return undefined;
  return { src: i.url, alt: i.alt ?? "", larghezza: i.width || 1200, altezza: i.height || 800 };
}

function immagineDaMedia(m?: WpMedia): Immagine | undefined {
  if (!m?.source_url) return undefined;
  return {
    src: m.source_url,
    alt: m.alt_text ?? "",
    larghezza: m.media_details?.width || 1200,
    altezza: m.media_details?.height || 800,
  };
}

const ILLUSTRAZIONE = /^[a-z0-9-]+$/;
/** Il campo select salva il nome del file ("foglie-carbone"): il percorso lo costruisce il sito. */
function illustrazione(v: unknown): string | undefined {
  const nome = stringa(v);
  return nome && ILLUSTRAZIONE.test(nome) ? `/illustrazioni/${nome}.svg` : undefined;
}

function idYoutube(v: unknown): string | undefined {
  const t = stringa(v);
  if (!t) return undefined;
  const m = t.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) ?? t.match(/^([\w-]{11})$/);
  return m?.[1];
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

async function inBozza(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false; // fuori da una richiesta (build, generateStaticParams)
  }
}

function intestazioniBozza(): HeadersInit {
  const utente = process.env.WP_PREVIEW_USER;
  const password = process.env.WP_PREVIEW_APP_PASSWORD;
  if (!utente || !password) return {};
  return { Authorization: `Basic ${Buffer.from(`${utente}:${password}`).toString("base64")}` };
}

type Parametri = Record<string, string | number | boolean | undefined>;

/**
 * GET sulla REST. Ritorna null se WordPress non è configurato, non risponde o dà errore.
 * `bozza: true` aggiunge status=any e l'autenticazione (solo se draftMode è attivo).
 */
export async function wpGet<T>(
  percorso: string,
  parametri: Parametri = {},
  opzioni: { bozza?: boolean } = {},
): Promise<T | null> {
  if (!BASE) return null;
  const bozza = opzioni.bozza ? await inBozza() : false;
  const url = new URL(`${BASE}${percorso}`);
  for (const [k, v] of Object.entries(parametri)) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }
  if (bozza) url.searchParams.set("status", "any");
  try {
    const r = await fetch(url, {
      headers: { Accept: "application/json", ...(bozza ? intestazioniBozza() : {}) },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      ...(bozza ? { cache: "no-store" as const } : { next: { revalidate: REVALIDATE, tags: ["wordpress"] } }),
    });
    if (!r.ok) {
      console.error(`[wordpress] ${r.status} su ${url.pathname}${url.search}`);
      return null;
    }
    return (await r.json()) as T;
  } catch (e) {
    console.error(`[wordpress] richiesta non riuscita: ${url.pathname}`, e instanceof Error ? e.message : e);
    return null;
  }
}

/**
 * Per i contenuti del blog un errore di WordPress (403, timeout…) NON deve diventare «lista vuota»:
 * la pagina ISR verrebbe rigenerata vuota e sostituirebbe quella buona. Lanciando, Next mantiene
 * l'ultima versione riuscita e riprova alla richiesta successiva.
 * Se WordPress non è configurato (mock/sviluppo) wpGet ritorna null e si resta sul vuoto.
 */
function richiesto<T>(risposta: T[] | null, cosa: string): T[] {
  if (risposta === null && BASE) throw new Error(`[wordpress] ${cosa} non disponibili: mantengo l'ultima versione in cache`);
  return risposta ?? [];
}

// ---------------------------------------------------------------------------
// Categorie
// ---------------------------------------------------------------------------

const getCategorieWpBase = cache(async (): Promise<(Categoria & { id: number })[]> => {
  const termini = await wpGet<WpTermine[]>("/categorie-articolo", {
    per_page: 100,
    orderby: "id",
    order: "asc",
    hide_empty: false,
    _fields: "id,slug,name",
  });
  return richiesto(termini, "categorie").map((t) => ({ id: t.id, slug: t.slug, nome: testoPulito(t.name) }));
});

export async function getCategorieWp(): Promise<Categoria[]> {
  return (await getCategorieWpBase()).map(({ slug, nome }) => ({ slug, nome }));
}

// ---------------------------------------------------------------------------
// Articoli
// ---------------------------------------------------------------------------

const CAMPI_ARTICOLO = "id,slug,date,title,excerpt,content,acf,yoast_head_json,_embedded,_links";
const PAROLE_AL_MINUTO = 200;

function categoriaDa(p: WpArticolo): Categoria {
  const termini = (p._embedded?.["wp:term"] ?? []).flat();
  const t = termini.find((x) => x.taxonomy === "categoria_articolo") ?? termini[0];
  return t ? { slug: t.slug, nome: testoPulito(t.name) } : { slug: "blog", nome: "Blog" };
}

function minutiLettura(acf: WpAcf, html: string): number {
  const manuale = Number(acf.minuti_lettura);
  if (Number.isFinite(manuale) && manuale > 0) return Math.round(manuale);
  const parole = testoPulito(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(parole / PAROLE_AL_MINUTO));
}

function sintesiArticolo(p: WpArticolo): ArticoloSintesi {
  const acf = acfDi(p);
  const seo = p.yoast_head_json;
  return {
    slug: p.slug,
    titolo: testoPulito(p.title.rendered),
    estratto: testoPulito(p.excerpt?.rendered),
    categoria: categoriaDa(p),
    data: p.date.slice(0, 10),
    minutiLettura: minutiLettura(acf, p.content?.rendered ?? ""),
    copertina: immagineDaMedia(p._embedded?.["wp:featuredmedia"]?.[0]),
    illustrazione: illustrazione(acf.illustrazione),
    seo: seo ? { titolo: stringa(seo.title), descrizione: stringa(seo.description) } : undefined,
  };
}

export async function getArticoliWp({
  categoria,
  limite,
}: { categoria?: string; limite?: number } = {}): Promise<ArticoloSintesi[]> {
  let idCategoria: number | undefined;
  if (categoria) {
    idCategoria = (await getCategorieWpBase()).find((c) => c.slug === categoria)?.id;
    if (!idCategoria) return [];
  }
  const post = await wpGet<WpArticolo[]>(
    "/articoli",
    {
      per_page: limite ?? 100,
      orderby: "date",
      order: "desc",
      _embed: "wp:featuredmedia,wp:term",
      _fields: CAMPI_ARTICOLO,
      "categorie-articolo": idCategoria,
    },
    { bozza: true },
  );
  return richiesto(post, "articoli").map(sintesiArticolo);
}

async function mediaPerId(id: number): Promise<Immagine | null> {
  const m = await wpGet<WpMedia>(`/media/${id}`, { _fields: "source_url,alt_text,media_details" });
  return immagineDaMedia(m ?? undefined) ?? null;
}

export async function getArticoloWp(slug: string): Promise<Articolo | null> {
  const lista = await wpGet<WpArticolo[]>(
    "/articoli",
    { slug, per_page: 1, _embed: "wp:featuredmedia,wp:term", _fields: CAMPI_ARTICOLO },
    { bozza: true },
  );
  const p = richiesto(lista, "articolo")[0];
  if (!p) return null;
  return { ...sintesiArticolo(p), corpo: await htmlToBlocchi(p.content?.rendered ?? "", mediaPerId) };
}

// ---------------------------------------------------------------------------
// Documentari
// ---------------------------------------------------------------------------

export async function getDocumentariWp(): Promise<Documentario[]> {
  const post = await wpGet<WpDocumentario[]>(
    "/documentari",
    { per_page: 100, orderby: "menu_order", order: "asc", _fields: "id,slug,date,title,menu_order,acf,yoast_head_json" },
    { bozza: true },
  );
  return (post ?? []).map((p, i) => {
    const acf = acfDi(p);
    return {
      numero: p.menu_order && p.menu_order > 0 ? p.menu_order : i + 1,
      slug: p.slug,
      titolo: testoPulito(p.title.rendered),
      luogo: stringa(acf.luogo) ?? "",
      partner: stringa(acf.partner) ?? "",
      durata: stringa(acf.durata),
      descrizione: stringa(acf.descrizione) ?? "",
      youtubeId: idYoutube(acf.youtube_id),
      copertina: immagineAcf(acf.copertina),
      illustrazione: illustrazione(acf.illustrazione),
      dataPubblicazione: stringa(acf.data_pubblicazione),
      segnaposto: acf.segnaposto === true || acf.segnaposto === 1 || undefined,
    };
  });
}

// ---------------------------------------------------------------------------
// Pagine (testi statici, opzioni globali, note legali)
// ---------------------------------------------------------------------------

export const SLUG_PAGINE = [
  "home",
  "il-progetto",
  "documentari",
  "blog",
  "contatti",
  "privacy",
  "cookie",
  "opzioni-globali",
] as const;
export type SlugPagina = (typeof SLUG_PAGINE)[number];

/** Tutte le pagine in una sola richiesta, indicizzate per slug. Vuoto se WordPress non risponde. */
export const getPagineWp = cache(async (): Promise<Partial<Record<SlugPagina, WpPagina>>> => {
  const lista = await wpGet<WpPagina[]>(
    "/pages",
    { slug: SLUG_PAGINE.join(","), per_page: 20, _fields: "id,slug,date,title,content,acf,yoast_head_json" },
    { bozza: true },
  );
  const mappa: Partial<Record<SlugPagina, WpPagina>> = {};
  for (const p of lista ?? []) {
    if ((SLUG_PAGINE as readonly string[]).includes(p.slug)) mappa[p.slug as SlugPagina] = p;
  }
  return mappa;
});
