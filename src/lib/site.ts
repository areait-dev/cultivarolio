/** Dati del sito: un solo posto per recapiti, social e obblighi del cofinanziamento. */
export const site = {
  nome: "Cultivar",
  titoloCompleto: "Cultivar – Storie di Olio d’Oliva IGP di Sicilia",
  descrizione:
    "Un viaggio nella Sicilia dell’olio extravergine d’oliva, raccontato attraverso i paesaggi, i sapori e i protagonisti della filiera.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "it_IT",

  navigazione: [
    { href: "/", etichetta: "Home" },
    { href: "/il-progetto", etichetta: "Il progetto" },
    { href: "/documentari", etichetta: "Documentari" },
    { href: "/blog", etichetta: "Blog" },
    { href: "/contatti", etichetta: "Contatti" },
  ],

  social: {
    youtube: "https://www.youtube.com/@CultivarOlio",
    instagram: "https://www.instagram.com/cultivarolio/",
    facebook: "https://www.facebook.com/cultivarolio",
    tiktok: "https://www.tiktok.com/@cultivarolio",
  },

  titolare: {
    ragioneSociale: "Promotergroup S.p.A.",
    sede: "Via del Carubo sn, Vittoria (RG)",
    telefono: "0932 862613",
    email: "info@cultivarolio.it",
    piva: "13178771005",
  },

  cofinanziamento: {
    testo:
      "Progetto cofinanziato dalla Regione Siciliana – Assessorato per le Attività Produttive – Iniziativa “Sicilia che piace 2026” – Capitolo di Bilancio 342525",
    // TODO obbligatorio prima della pubblicazione
    cup: null as string | null,
    logoRegione: "/logo/regione-siciliana.svg" as string | null,
  },
} as const;

export type VoceNavigazione = (typeof site.navigazione)[number];
