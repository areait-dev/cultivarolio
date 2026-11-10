/**
 * Modello dei contenuti. È indipendente dal CMS: ogni adattatore
 * (Sanity, Strapi, WordPress headless, …) deve restituire questi tipi.
 */

export type Immagine = {
  src: string;
  alt: string;
  larghezza: number;
  altezza: number;
};

export type Categoria = {
  slug: string;
  nome: string;
};

/** Corpo dell'articolo come blocchi strutturati (niente HTML libero dal CMS). */
export type Blocco =
  | { tipo: "paragrafo"; testo: string }
  | { tipo: "titolo"; testo: string }
  | { tipo: "citazione"; testo: string; fonte?: string }
  | { tipo: "elenco"; voci: string[]; ordinato?: boolean }
  | { tipo: "immagine"; immagine: Immagine; didascalia?: string };

export type Articolo = {
  slug: string;
  titolo: string;
  estratto: string;
  categoria: Categoria;
  /** ISO 8601, es. "2026-11-12" */
  data: string;
  minutiLettura: number;
  copertina?: Immagine;
  /** Illustrazione del marchio usata quando manca la copertina */
  illustrazione?: string;
  corpo: Blocco[];
  seo?: { titolo?: string; descrizione?: string };
};

export type ArticoloSintesi = Omit<Articolo, "corpo">;

export type Documentario = {
  numero: number;
  slug: string;
  titolo: string;
  luogo: string; // "Chiaramonte Gulfi (RG)"
  partner: string; // "Frantoi Cutrera srl"
  durata: string; // "18:40"
  descrizione: string;
  /** ID del video YouTube; se assente il video è "in arrivo" */
  youtubeId?: string;
  copertina?: Immagine;
  illustrazione?: string;
  /** ISO 8601 di pubblicazione su YouTube (serve ai dati strutturati VideoObject) */
  dataPubblicazione?: string;
  /** true finché titolo e testi sono provvisori */
  segnaposto?: boolean;
};

export type ContentSource = {
  getArticoli(opzioni?: { categoria?: string; limite?: number }): Promise<ArticoloSintesi[]>;
  getArticolo(slug: string): Promise<Articolo | null>;
  getCategorie(): Promise<Categoria[]>;
  getDocumentari(): Promise<Documentario[]>;
};
