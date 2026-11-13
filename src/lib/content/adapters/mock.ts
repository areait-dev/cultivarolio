import { corpo28Cultivar } from "./articolo-28-cultivar";
import type { Articolo, Categoria, ContentSource, Documentario } from "../types";

/**
 * Adattatore segnaposto: stessi testi dell'anteprima.
 * Serve a sviluppare e approvare il layout finché il CMS non è collegato.
 */

const categorie: Categoria[] = [
  { slug: "conoscere-l-olio", nome: "Conoscere l’olio" },
  { slug: "filiera", nome: "Filiera" },
  { slug: "territori", nome: "Territori" },
  { slug: "degustazione", nome: "Degustazione" },
];
const cat = (slug: string) => categorie.find((c) => c.slug === slug)!;

const articoli: Articolo[] = [
  {
    slug: "le-28-cultivar-dell-olio-evo-sicilia-igp",
    titolo: "Le 28 cultivar dell’Olio EVO Sicilia IGP: viaggio tra varietà e territori",
    estratto:
      "Biancolilla, Cerasuola, Nocellara del Belice, Tonda Iblea: le 28 cultivar del disciplinare e i territori che raccontano.",
    categoria: cat("conoscere-l-olio"),
    data: "2026-11-13",
    minutiLettura: 6,
    illustrazione: "/illustrazioni/foglie-carbone.svg",
    corpo: corpo28Cultivar,
  },
];

/** Episodi in lavorazione: niente titoli, durate o descrizioni inventati finché i video non sono pronti. */
const documentari: Documentario[] = [
  {
    numero: 1,
    slug: "chiaramonte-gulfi",
    titolo: "Chiaramonte Gulfi",
    luogo: "Chiaramonte Gulfi (RG)",
    partner: "Frantoi Cutrera srl",
    descrizione: "Episodio in lavorazione, in collaborazione con Frantoi Cutrera srl.",
    illustrazione: "/illustrazioni/grappolo-carbone.svg",
    segnaposto: true,
  },
  {
    numero: 2,
    slug: "mirabella-imbaccari",
    titolo: "Mirabella Imbaccari",
    luogo: "Mirabella Imbaccari (CT)",
    partner: "Frantoi Beretta",
    descrizione: "Episodio in lavorazione, in collaborazione con Frantoi Beretta.",
    illustrazione: "/illustrazioni/ramo-olive-carbone.svg",
    segnaposto: true,
  },
  {
    numero: 3,
    slug: "partanna",
    titolo: "Partanna",
    luogo: "Partanna (TP)",
    partner: "Olivoil srl – Oleificio Geraci",
    descrizione: "Episodio in lavorazione, in collaborazione con Olivoil srl – Oleificio Geraci.",
    illustrazione: "/illustrazioni/ramo-colore.svg",
    segnaposto: true,
  },
];

const sintesi = ({ corpo: _c, ...resto }: Articolo) => resto;

export const mockSource: ContentSource = {
  async getArticoli({ categoria, limite } = {}) {
    const lista = articoli
      .filter((a) => !categoria || a.categoria.slug === categoria)
      .sort((a, b) => b.data.localeCompare(a.data))
      .map(sintesi);
    return limite ? lista.slice(0, limite) : lista;
  },
  async getArticolo(slug) {
    return articoli.find((a) => a.slug === slug) ?? null;
  },
  async getCategorie() {
    return categorie;
  },
  async getDocumentari() {
    return documentari;
  },
};
