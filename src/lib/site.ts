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

  // TODO: sostituire con gli URL reali dei profili
  social: {
    youtube: "https://www.youtube.com/",
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    tiktok: "https://www.tiktok.com/",
  },

  titolare: {
    ragioneSociale: "Promotergroup S.p.A.",
    unit: "PromoCommunication",
    sede: "Via del Carrubbo sn, Vittoria (RG)",
    telefono: "0932 862613",
    email: "comunicazione@promotergroup.eu",
    piva: "13178771005",
  },

  cofinanziamento: {
    testo:
      "Progetto cofinanziato dalla Regione Siciliana – Assessorato per le Attività Produttive – Iniziativa “Sicilia che piace 2026” – Capitolo di Bilancio 342525",
    // TODO obbligatorio prima della pubblicazione
    cup: null as string | null,
    // TODO: inserire /public/logo/regione-siciliana.svg e indicarne qui il percorso
    logoRegione: null as string | null,
  },
} as const;

export type VoceNavigazione = (typeof site.navigazione)[number];
