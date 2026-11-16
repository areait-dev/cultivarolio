import "server-only";
import { cache } from "react";
import { site, type Sito } from "./site";
import { testiDefault, type Testi } from "./testi";
import { sanitizzaHtml } from "./html-sicuro";
import {
  acfDi,
  getPagineWp,
  gruppo,
  immagineAcf,
  stringa,
  type SlugPagina,
  type WpAcf,
} from "./wordpress";

/**
 * Testi e dati del sito letti da WordPress (pagine con campi ACF).
 * Ogni campo vuoto o mancante ricade sul valore di riserva in testi.ts / site.ts:
 * se WordPress non risponde il sito resta identico a prima, senza errori.
 */

// --- liste "una voce per riga" -------------------------------------------------

/** Righe non vuote di una textarea. */
function righe(v: unknown): string[] {
  return typeof v === "string" ? v.split(/\r?\n/).map((r) => r.trim()).filter(Boolean) : [];
}

/** "A | B | C" → [A, B, C]; l'ultima parte tiene anche eventuali "|" successivi. Null se mancano parti o sono vuote. */
function dividi(riga: string, n: number): string[] | null {
  const parti = riga.split("|").map((p) => p.trim());
  if (parti.length < n) return null;
  const risultato = [...parti.slice(0, n - 1), parti.slice(n - 1).join(" | ")];
  return risultato.every(Boolean) ? risultato : null;
}

const t = (v: unknown, riserva: string) => stringa(v) ?? riserva;

function listaOppure<T>(v: unknown, mappa: (riga: string) => T | null, riserva: T[]): T[] {
  const voci = righe(v)
    .map(mappa)
    .filter((x): x is T => x !== null);
  return voci.length ? voci : riserva;
}

// --- testi ---------------------------------------------------------------------

export const getTesti = cache(async (): Promise<Testi> => {
  const pagine = await getPagineWp();
  const d = testiDefault;

  const home = acfDi(pagine.home);
  const progetto = acfDi(pagine["il-progetto"]);
  const documentari = acfDi(pagine.documentari);
  const blog = acfDi(pagine.blog);
  const contatti = acfDi(pagine.contatti);
  const opzioni = acfDi(pagine["opzioni-globali"]);

  const breve = gruppo(home.breve);
  const numeri = gruppo(home.numeri);
  const homeDoc = gruppo(home.documentari);
  const homeBlog = gruppo(home.blog);
  const invito = gruppo(opzioni.invito);
  const obiettivi = gruppo(progetto.obiettivi);
  const storie = gruppo(progetto.storie);
  const territori = gruppo(progetto.territori);
  const chi = gruppo(progetto.chi);

  return {
    home: {
      titoloResto: t(home.titolo_resto, d.home.titoloResto),
      sottotitolo: t(home.sottotitolo, d.home.sottotitolo),
      pulsanteDocumentari: t(home.pulsante_documentari, d.home.pulsanteDocumentari),
      pulsanteProgetto: t(home.pulsante_progetto, d.home.pulsanteProgetto),
      breve: {
        titolo: t(breve.titolo, d.home.breve.titolo),
        paragrafi: righe(breve.paragrafi).length ? righe(breve.paragrafi) : [...d.home.breve.paragrafi],
        pulsante: t(breve.pulsante, d.home.breve.pulsante),
      },
      numeri: {
        territori: t(numeri.territori, d.home.numeri.territori),
        documentari: t(numeri.documentari, d.home.numeri.documentari),
      },
      documentari: {
        titolo: t(homeDoc.titolo, d.home.documentari.titolo),
        intro: t(homeDoc.intro, d.home.documentari.intro),
        pulsante: t(homeDoc.pulsante, d.home.documentari.pulsante),
      },
      blog: {
        titolo: t(homeBlog.titolo, d.home.blog.titolo),
        link: t(homeBlog.link, d.home.blog.link),
      },
      invito: {
        testo: t(invito.testo, d.home.invito.testo),
        pulsante: t(invito.pulsante, d.home.invito.pulsante),
      },
    },
    progetto: {
      titolo: t(progetto.titolo, d.progetto.titolo),
      introduzione: t(progetto.introduzione, d.progetto.introduzione),
      obiettivi: {
        titolo: t(obiettivi.titolo, d.progetto.obiettivi.titolo),
        voci: listaOppure(
          obiettivi.voci,
          (r) => {
            const p = dividi(r, 3);
            return p ? { verbo: p[0], oggetto: p[1], testo: p[2] } : null;
          },
          d.progetto.obiettivi.voci.map((v) => ({ ...v })),
        ),
      },
      storie: {
        titolo: t(storie.titolo, d.progetto.storie.titolo),
        voci: listaOppure(
          storie.voci,
          (r) => {
            const p = dividi(r, 2);
            return p ? { titolo: p[0], testo: p[1] } : null;
          },
          d.progetto.storie.voci.map((v) => ({ ...v })),
        ),
      },
      territori: {
        titolo: t(territori.titolo, d.progetto.territori.titolo),
        testo: t(territori.testo, d.progetto.territori.testo),
      },
      chi: {
        titolo: t(chi.titolo, d.progetto.chi.titolo),
        realizzazione: t(chi.realizzazione, d.progetto.chi.realizzazione),
        consorzio: t(chi.consorzio, d.progetto.chi.consorzio),
      },
    },
    documentari: {
      titolo: t(documentari.titolo, d.documentari.titolo),
      intro: t(documentari.intro, d.documentari.intro),
      etichette: { ...d.documentari.etichette },
      invito: t(documentari.invito, d.documentari.invito),
      pulsante: t(documentari.pulsante, d.documentari.pulsante),
    },
    blog: {
      titolo: t(blog.titolo, d.blog.titolo),
      intro: t(blog.intro, d.blog.intro),
      elenco: t(blog.elenco, d.blog.elenco),
    },
    contatti: {
      titolo: t(contatti.titolo, d.contatti.titolo),
      intro: t(contatti.intro, d.contatti.intro),
      profili: righe(contatti.profili).length ? righe(contatti.profili) : [...d.contatti.profili],
    },
  };
});

// --- dati del sito (opzioni globali) -------------------------------------------

export const getSito = cache(async (): Promise<Sito> => {
  const pagine = await getPagineWp();
  const o = acfDi(pagine["opzioni-globali"]);
  const sito = gruppo(o.sito);
  const social = gruppo(o.social);
  const titolare = gruppo(o.titolare);
  const cofin = gruppo(o.cofinanziamento);
  const logo = immagineAcf(cofin.logo_regione);
  const base: Sito = { ...site, navigazione: site.navigazione.map((v) => ({ ...v })) };

  return {
    ...base,
    nome: t(sito.nome, base.nome),
    titoloCompleto: t(sito.titolo_completo, base.titoloCompleto),
    descrizione: t(sito.descrizione, base.descrizione),
    social: {
      youtube: t(social.youtube, base.social.youtube),
      instagram: t(social.instagram, base.social.instagram),
      facebook: t(social.facebook, base.social.facebook),
      tiktok: t(social.tiktok, base.social.tiktok),
    },
    titolare: {
      ragioneSociale: t(titolare.ragione_sociale, base.titolare.ragioneSociale),
      sede: t(titolare.sede, base.titolare.sede),
      telefono: t(titolare.telefono, base.titolare.telefono),
      email: t(titolare.email, base.titolare.email),
      piva: t(titolare.piva, base.titolare.piva),
    },
    cofinanziamento: {
      testo: t(cofin.testo, base.cofinanziamento.testo),
      cup: stringa(cofin.cup) ?? base.cofinanziamento.cup,
      logoRegione: logo?.src ?? base.cofinanziamento.logoRegione,
    },
  };
});

/** Immagine di condivisione scelta in WordPress (opzioni-globali), se c'è. */
export const getImmagineOg = cache(async () => {
  const pagine = await getPagineWp();
  return immagineAcf(gruppo(acfDi(pagine["opzioni-globali"]).sito).immagine_og);
});

// --- SEO (Yoast) -----------------------------------------------------------------

/** Titolo e descrizione Yoast di una pagina; vuoti se non impostati o se WordPress non risponde. */
export async function getSeoPagina(slug: SlugPagina): Promise<{ titolo?: string; descrizione?: string }> {
  const y = (await getPagineWp())[slug]?.yoast_head_json;
  return { titolo: stringa(y?.title), descrizione: stringa(y?.description) };
}

// --- pagine legali (privacy, cookie) ------------------------------------------

export const SEGNAPOSTO_CONSENSO = "{{riapri_consenso}}";

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type PaginaLegale = {
  /** HTML pulito, con i segnaposto già sostituiti; può contenere {{riapri_consenso}} */
  html: string;
  titolo?: string;
  mostraNotaBozza: boolean;
  /** true se il testo viene da WordPress, false se si usa quello di riserva nel codice */
  daWordpress: boolean;
};

/** Sostituisce {{ragione_sociale}}, {{sede}}, {{piva}}, {{email}}, {{telefono}} con i dati di opzioni-globali. */
function sostituisciSegnaposto(html: string, sito: Sito): string {
  const valori: Record<string, string> = {
    ragione_sociale: sito.titolare.ragioneSociale,
    sede: sito.titolare.sede,
    piva: sito.titolare.piva,
    email: sito.titolare.email,
    telefono: sito.titolare.telefono,
  };
  return html.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (tutto, chiave: string) =>
    chiave in valori ? escapeHtml(valori[chiave]) : tutto,
  );
}

export async function getPaginaLegale(slug: "privacy" | "cookie"): Promise<PaginaLegale | null> {
  const [pagine, sito] = await Promise.all([getPagineWp(), getSito()]);
  const p = pagine[slug];
  const grezzo = p?.content?.rendered ?? "";
  const pulito = sanitizzaHtml(grezzo);
  if (!p || !pulito) return null;
  const acf: WpAcf = acfDi(p);
  return {
    html: sostituisciSegnaposto(pulito, sito),
    mostraNotaBozza: acf.mostra_nota_bozza !== false && acf.mostra_nota_bozza !== 0,
    daWordpress: true,
  };
}
