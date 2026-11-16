#!/usr/bin/env node
/**
 * Genera i field group ACF (solo ACF FREE) in /acf-json.
 *
 *   node scripts/genera-acf-json.mjs
 *
 * I JSON generati sono versionati in Git. Per usarli: copia la cartella acf-json in
 * wp-content/acf-json, poi in WordPress: Custom Fields → Field Groups → "Sync".
 * Se cambi i campi, modifica QUESTO file e rigenera: le chiavi (group_cultivar_*, field_cultivar_*) sono
 * stabili, così ACF riconosce gli stessi campi e non perde i contenuti già inseriti.
 *
 * Vincoli rispettati: niente repeater, flexible content, gallery, clone, Options Page.
 * Tipi usati: text, textarea, number, email, url, image, select, true_false, date_picker, group.
 * Le liste ripetute sono textarea "una voce per riga" (il frontend fa split su \n); le coppie
 * come "Titolo | Testo" usano la barra verticale.
 * Posizione: pagine per slug (regola "Slug pagina" registrata dal mu-plugin cultivar-setup.php).
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const radice = join(dirname(fileURLToPath(import.meta.url)), "..");
const uscita = join(radice, "acf-json");

// ---------------------------------------------------------------------------
// Costruttori di campi
// ---------------------------------------------------------------------------

const comuni = (chiave, nome, etichetta, opz) => ({
  key: chiave,
  label: etichetta,
  name: nome,
  "aria-label": "",
  type: undefined,
  instructions: opz.istruzioni ?? "",
  required: opz.obbligatorio ? 1 : 0,
  conditional_logic: 0,
  wrapper: { width: opz.larghezza ?? "", class: "", id: "" },
});

/** Ogni funzione ritorna una funzione (prefisso) => campo, così le chiavi nascono dal percorso. */
const campo = (tipo, nome, etichetta, opz = {}, extra = {}) => (prefisso) => {
  const chiave = `field_cultivar_${prefisso}_${nome}`;
  return { ...comuni(chiave, nome, etichetta, opz), type: tipo, ...extra };
};

const testo = (n, e, o = {}) =>
  campo("text", n, e, o, { default_value: "", maxlength: "", placeholder: o.segnaposto ?? "", prepend: "", append: "" });
const area = (n, e, o = {}) =>
  campo("textarea", n, e, o, {
    default_value: "",
    maxlength: "",
    placeholder: o.segnaposto ?? "",
    rows: o.righe ?? 4,
    new_lines: "",
  });
const numero = (n, e, o = {}) =>
  campo("number", n, e, o, { default_value: "", min: o.min ?? "", max: "", step: "", placeholder: "", prepend: "", append: o.suffisso ?? "" });
const email = (n, e, o = {}) =>
  campo("email", n, e, o, { default_value: "", placeholder: "", prepend: "", append: "" });
const url = (n, e, o = {}) => campo("url", n, e, o, { default_value: "", placeholder: "https://" });
const immagine = (n, e, o = {}) =>
  campo("image", n, e, o, {
    return_format: "array",
    library: "all",
    min_width: 0,
    min_height: 0,
    min_size: 0,
    max_width: 0,
    max_height: 0,
    max_size: 0,
    mime_types: o.tipi ?? "",
    preview_size: "medium",
  });
const scelta = (n, e, scelte, o = {}) =>
  campo("select", n, e, o, {
    choices: scelte,
    default_value: false,
    return_format: "value",
    multiple: 0,
    allow_null: 1,
    ui: 0,
    ajax: 0,
    placeholder: "",
  });
const vero_falso = (n, e, predefinito, o = {}) =>
  campo("true_false", n, e, o, {
    message: "",
    default_value: predefinito ? 1 : 0,
    ui: 1,
    ui_on_text: "Sì",
    ui_off_text: "No",
  });
const data = (n, e, o = {}) =>
  campo("date_picker", n, e, o, { display_format: "d/m/Y", return_format: "Y-m-d", first_day: 1 });

/** Campo group ACF (ammesso nella versione free): nell'API REST diventa un oggetto annidato. */
const sezione = (nome, etichetta, campi, o = {}) => (prefisso) => {
  const mio = `${prefisso}_${nome}`;
  return {
    ...comuni(`field_cultivar_${mio}`, nome, etichetta, o),
    type: "group",
    layout: "block",
    sub_fields: campi.map((c) => c(mio)),
  };
};

// ---------------------------------------------------------------------------
// Field group
// ---------------------------------------------------------------------------

const MARCA_TEMPORALE = 1788000000; // fisso: così rigenerare non sporca il diff di Git

function gruppo(id, titolo, campi, posizione, o = {}) {
  return {
    key: `group_cultivar_${id}`,
    title: titolo,
    fields: campi.map((c) => c(id)),
    location: posizione,
    menu_order: o.ordine ?? 0,
    position: "normal",
    style: "default",
    label_placement: "top",
    instruction_placement: "label",
    hide_on_screen: "",
    active: true,
    description: o.descrizione ?? "",
    show_in_rest: 1,
    modified: MARCA_TEMPORALE,
  };
}

const perPagina = (...slug) => slug.map((s) => [{ param: "page_slug", operator: "==", value: s }]);
const perTipo = (tipo) => [[{ param: "post_type", operator: "==", value: tipo }]];

// Illustrazioni del marchio disponibili in public/illustrazioni (il valore è il nome del file senza estensione)
const illustrazioni = Object.fromEntries(
  readdirSync(join(radice, "public", "illustrazioni"))
    .filter((f) => f.endsWith(".svg"))
    .sort()
    .map((f) => [f.replace(/\.svg$/, ""), f.replace(/\.svg$/, "")]),
);

const gruppi = [
  // --- CPT ------------------------------------------------------------------------
  gruppo(
    "documentario",
    "Documentario",
    [
      testo("luogo", "Luogo", { istruzioni: "Città e provincia, es. «Chiaramonte Gulfi (RG)».", obbligatorio: true }),
      testo("partner", "Partner", { istruzioni: "Es. «Frantoi Cutrera srl»." }),
      testo("durata", "Durata", {
        istruzioni: "Formato mm:ss, es. 18:40. Lasciare vuoto finché il video non è pronto: la scheda mostra «In arrivo».",
        larghezza: "50",
      }),
      testo("youtube_id", "ID o link del video YouTube", {
        istruzioni: "Incolla il link del video o il solo ID (11 caratteri). Vuoto = video «in arrivo».",
        larghezza: "50",
      }),
      area("descrizione", "Descrizione", { righe: 4 }),
      immagine("copertina", "Copertina", {
        istruzioni: "Anteprima del video, servita dal sito (nessuna richiesta a YouTube prima del click).",
      }),
      scelta("illustrazione", "Illustrazione", illustrazioni, {
        istruzioni: "Illustrazione del marchio usata nella scheda quando manca la copertina.",
      }),
      data("data_pubblicazione", "Data di pubblicazione su YouTube", {
        istruzioni: "Serve ai dati strutturati per Google. Compare quando il video è online.",
      }),
      vero_falso("segnaposto", "Titolo e testi provvisori", true, {
        istruzioni: "Attivo finché titolo e testi non sono definitivi.",
      }),
    ],
    perTipo("documentario"),
    {
      descrizione:
        "L'ordine degli episodi si imposta con «Ordine» (Attributi della pagina): 1, 2, 3. Il titolo è il nome della città.",
    },
  ),
  gruppo(
    "articolo",
    "Articolo del blog",
    [
      scelta("illustrazione", "Illustrazione", illustrazioni, {
        istruzioni: "Illustrazione del marchio usata come anteprima e in chiusura articolo quando manca l'immagine in evidenza.",
      }),
      numero("minuti_lettura", "Minuti di lettura", {
        istruzioni: "Facoltativo: se vuoto si calcola dal numero di parole.",
        min: 1,
        suffisso: "min",
      }),
    ],
    perTipo("articolo"),
    {
      descrizione:
        "Titolo, estratto, data, categoria e immagine in evidenza usano i campi normali di WordPress. Nel corpo: H2 = titolo, H3 = sottotitolo, citazione, elenchi, immagini.",
    },
  ),

  // --- Pagine ---------------------------------------------------------------------
  gruppo(
    "home",
    "Pagina · Home",
    [
      testo("titolo_resto", "Titolo (dopo «Cultivar.»)", { istruzioni: "Es. «Storie di Olio d’Oliva IGP di Sicilia»." }),
      area("sottotitolo", "Sottotitolo", { righe: 3 }),
      testo("pulsante_documentari", "Pulsante documentari", { larghezza: "50" }),
      testo("pulsante_progetto", "Pulsante progetto", { larghezza: "50" }),
      sezione("breve", "Il progetto in breve", [
        testo("titolo", "Titolo"),
        area("paragrafi", "Paragrafi", { istruzioni: "Un paragrafo per riga.", righe: 6 }),
        testo("pulsante", "Pulsante"),
      ]),
      sezione("numeri", "Didascalie dei numeri", [
        testo("territori", "Sotto «N territori»", { larghezza: "50" }),
        testo("documentari", "Sotto «N documentari»", { larghezza: "50" }),
      ], { istruzioni: "Le cifre si contano da sole dai documentari pubblicati." }),
      sezione("documentari", "Sezione documentari", [
        testo("titolo", "Titolo"),
        area("intro", "Introduzione", { righe: 3 }),
        testo("pulsante", "Pulsante"),
      ]),
      sezione("blog", "Sezione blog", [testo("titolo", "Titolo"), testo("link", "Testo del link")]),
    ],
    perPagina("home"),
  ),
  gruppo(
    "il_progetto",
    "Pagina · Il progetto",
    [
      testo("titolo", "Titolo"),
      area("introduzione", "Introduzione", { righe: 6 }),
      sezione("obiettivi", "Gli obiettivi", [
        testo("titolo", "Titolo"),
        area("voci", "Voci", {
          istruzioni: "Una voce per riga, nel formato: Verbo | Oggetto | Descrizione",
          segnaposto: "Valorizzare | un’eccellenza certificata | Far conoscere la qualità…",
          righe: 6,
        }),
      ]),
      sezione("storie", "Cosa raccontano le storie", [
        testo("titolo", "Titolo"),
        area("voci", "Voci", {
          istruzioni: "Una voce per riga, nel formato: Titolo | Descrizione. Le prime tre vanno in colonna, la quarta è in evidenza.",
          segnaposto: "I luoghi | I territori, i paesaggi…",
          righe: 6,
        }),
      ]),
      sezione("territori", "I territori del racconto", [testo("titolo", "Titolo"), area("testo", "Testo", { righe: 4 })]),
      sezione("chi", "Chi realizza il progetto", [
        testo("titolo", "Titolo"),
        area("realizzazione", "Realizzazione", { righe: 4 }),
        area("consorzio", "Consorzio", { righe: 4 }),
      ]),
    ],
    perPagina("il-progetto"),
  ),
  gruppo(
    "documentari_pagina",
    "Pagina · Documentari",
    [
      testo("titolo", "Titolo"),
      area("intro", "Introduzione", { righe: 4 }),
      area("invito", "Invito a iscriversi", { righe: 2 }),
      testo("pulsante", "Pulsante"),
    ],
    perPagina("documentari"),
  ),
  gruppo(
    "blog_pagina",
    "Pagina · Blog",
    [testo("titolo", "Titolo"), area("intro", "Introduzione", { righe: 4 }), testo("elenco", "Titolo dell'elenco articoli")],
    perPagina("blog"),
  ),
  gruppo(
    "contatti_pagina",
    "Pagina · Contatti",
    [
      testo("titolo", "Titolo"),
      area("intro", "Introduzione", { righe: 3 }),
      area("profili", "Profili del modulo («Chi sei»)", {
        istruzioni: "Una voce per riga. L'ultima è quella predefinita per i campi non riconosciuti: tenere «Altro» in fondo.",
        segnaposto: "Consumatore\nBuyer\nOperatore Ho.Re.Ca.\nProduttore\nStampa\nAltro",
        righe: 7,
      }),
    ],
    perPagina("contatti"),
  ),
  gruppo(
    "note_legali",
    "Pagina · Note legali (privacy e cookie)",
    [
      vero_falso("mostra_nota_bozza", "Mostra la nota «Bozza da validare»", true, {
        istruzioni:
          "Disattivare quando il legale ha validato il testo. Nel testo si possono usare i segnaposto {{ragione_sociale}}, {{sede}}, {{piva}}, {{email}}, {{telefono}} (dati da «Opzioni globali») e {{riapri_consenso}} (pulsante delle preferenze cookie).",
      }),
    ],
    perPagina("privacy", "cookie"),
    { descrizione: "Il testo si scrive nell'editor della pagina: titoli H2, paragrafi, elenchi, link." },
  ),
  gruppo(
    "opzioni_globali",
    "Pagina · Opzioni globali",
    [
      sezione("sito", "Sito", [
        testo("nome", "Nome del sito", { larghezza: "50" }),
        testo("titolo_completo", "Titolo completo", { larghezza: "50" }),
        area("descrizione", "Descrizione", { righe: 3 }),
        immagine("immagine_og", "Immagine di condivisione (Open Graph)", {
          istruzioni: "1200×630 px. Se vuota si usa quella predefinita del sito.",
        }),
      ]),
      sezione("social", "Social", [
        url("youtube", "YouTube"),
        url("instagram", "Instagram"),
        url("facebook", "Facebook"),
        url("tiktok", "TikTok"),
      ]),
      sezione("titolare", "Titolare e recapiti", [
        testo("ragione_sociale", "Ragione sociale"),
        testo("sede", "Sede"),
        testo("telefono", "Telefono", { larghezza: "33" }),
        email("email", "Email", { larghezza: "33" }),
        testo("piva", "Partita IVA", { larghezza: "33" }),
      ]),
      sezione("cofinanziamento", "Cofinanziamento", [
        area("testo", "Testo obbligatorio del cofinanziamento", { righe: 3 }),
        testo("cup", "CUP", { istruzioni: "Obbligatorio prima della pubblicazione." }),
        immagine("logo_regione", "Logo Regione Siciliana"),
      ]),
      sezione("invito", "Invito al canale YouTube", [testo("testo", "Testo"), testo("pulsante", "Pulsante")]),
    ],
    perPagina("opzioni-globali"),
    { descrizione: "Pagina speciale: non è visibile sul sito. Salvandola si aggiornano footer, social e recapiti in tutto il sito." },
  ),
];

// ---------------------------------------------------------------------------
// Scrittura
// ---------------------------------------------------------------------------

rmSync(uscita, { recursive: true, force: true });
mkdirSync(uscita, { recursive: true });
for (const g of gruppi) {
  writeFileSync(join(uscita, `${g.key}.json`), JSON.stringify(g, null, 4) + "\n", "utf8");
}
console.log(`${gruppi.length} field group scritti in ${uscita}`);
