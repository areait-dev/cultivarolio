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

const corpoEsempio = [
  {
    tipo: "paragrafo" as const,
    testo:
      "Testo segnaposto per mostrare la tipografia dell’articolo. Denominazione, campagna olearia, origine delle olive: sull’etichetta di un Olio Extra Vergine di Oliva Sicilia IGP ci sono le informazioni che servono per scegliere con consapevolezza.",
  },
  { tipo: "titolo" as const, testo: "La denominazione" },
  {
    tipo: "paragrafo" as const,
    testo:
      "Paragrafo d’esempio. Il testo corrente è in Poppins con interlinea ampia; i sottotitoli usano il carattere display in minuscolo.",
  },
  { tipo: "citazione" as const, testo: "Un prodotto si capisce davvero quando se ne conosce la storia." },
  { tipo: "titolo" as const, testo: "Cosa cercare" },
  {
    tipo: "elenco" as const,
    voci: [
      "La dicitura “Sicilia IGP” e il logo europeo",
      "L’annata o la campagna di raccolta",
      "Il nome del produttore e il luogo di confezionamento",
    ],
  },
];

const articoli: Articolo[] = [
  {
    slug: "come-si-legge-l-etichetta-di-un-olio-igp",
    titolo: "Come si legge l’etichetta di un olio IGP",
    estratto: "Denominazione, campagna olearia, origine: cosa cercare prima di acquistare.",
    categoria: cat("conoscere-l-olio"),
    data: "2026-11-12",
    minutiLettura: 5,
    illustrazione: "/illustrazioni/foglie-carbone.svg",
    corpo: corpoEsempio,
  },
  {
    slug: "dalla-raccolta-alla-molitura-in-24-ore",
    titolo: "Dalla raccolta alla molitura in 24 ore",
    estratto: "Perché i tempi tra campagna e frantoio cambiano il profilo dell’olio.",
    categoria: cat("filiera"),
    data: "2026-11-05",
    minutiLettura: 4,
    illustrazione: "/illustrazioni/coppia-olive-carbone.svg",
    corpo: corpoEsempio,
  },
  {
    slug: "fruttato-amaro-piccante",
    titolo: "Fruttato, amaro, piccante",
    estratto: "I tre attributi positivi e come riconoscerli all’assaggio.",
    categoria: cat("degustazione"),
    data: "2026-10-28",
    minutiLettura: 6,
    illustrazione: "/illustrazioni/oliva-colore.svg",
    corpo: corpoEsempio,
  },
  {
    slug: "tre-province-una-stessa-cultura-dell-olio",
    titolo: "Tre province, una stessa cultura dell’olio",
    estratto: "Ragusa, Catania e Trapani: paesaggi diversi lungo il viaggio di Cultivar.",
    categoria: cat("territori"),
    data: "2026-10-20",
    minutiLettura: 5,
    illustrazione: "/illustrazioni/ramo-lungo-colore.svg",
    corpo: corpoEsempio,
  },
  {
    slug: "il-frantoio-che-recupera-i-sottoprodotti",
    titolo: "Il frantoio che recupera i sottoprodotti",
    estratto: "Sanse, acque di vegetazione e noccioli: dall’impatto ambientale all’economia circolare.",
    categoria: cat("filiera"),
    data: "2026-10-14",
    minutiLettura: 7,
    illustrazione: "/illustrazioni/rametto-colore.svg",
    corpo: corpoEsempio,
  },
  {
    slug: "cosa-significa-igp",
    titolo: "Cosa significa IGP",
    estratto: "Indicazione Geografica Protetta: regole, controlli e ruolo del Consorzio di Tutela.",
    categoria: cat("conoscere-l-olio"),
    data: "2026-10-07",
    minutiLettura: 4,
    illustrazione: "/illustrazioni/alloro-carbone.svg",
    corpo: corpoEsempio,
  },
];

const documentari: Documentario[] = [
  {
    numero: 1,
    slug: "il-tempo-della-raccolta",
    titolo: "Il tempo della raccolta",
    luogo: "Chiaramonte Gulfi (RG)",
    partner: "Frantoi Cutrera srl",
    durata: "18:40",
    descrizione:
      "Nelle campagne iblee, dalla raccolta alla molitura: le voci di chi custodisce la tradizione olearia del territorio.",
    illustrazione: "/illustrazioni/grappolo-carbone.svg",
    segnaposto: true,
  },
  {
    numero: 2,
    slug: "il-gusto-del-calatino",
    titolo: "Il gusto del Calatino",
    luogo: "Mirabella Imbaccari (CT)",
    partner: "Frantoi Beretta",
    durata: "16:20",
    descrizione:
      "Assaggio, controlli di qualità e riconoscibilità dell’Olio EVO Sicilia IGP raccontati da chi lo produce.",
    illustrazione: "/illustrazioni/ramo-olive-carbone.svg",
    segnaposto: true,
  },
  {
    numero: 3,
    slug: "la-valle-del-belice",
    titolo: "La Valle del Belice",
    luogo: "Partanna (TP)",
    partner: "Olivoil srl – Oleificio Geraci",
    durata: "19:05",
    descrizione:
      "Innovazione, efficienza energetica e recupero dei residui di molitura in una filiera che guarda all’economia circolare.",
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
