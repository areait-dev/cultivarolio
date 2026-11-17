import { HTMLElement, Node, NodeType, parse } from "node-html-parser";
import type { Blocco, Immagine } from "./content/types";

/**
 * Converte l'HTML dell'editor WordPress (content.rendered) nei blocchi del sito.
 * Usa un parser vero, non regex. Nulla si perde in silenzio:
 * - tag non riconosciuti diventano paragrafi con il testo ripulito (e un avviso nel log);
 * - solo script/style/noscript vengono scartati, di proposito.
 *
 * Mappa: h1-h2 → titolo · h3-h6 → sottotitolo · p → paragrafo · blockquote → citazione ·
 *        ul/ol → elenco · figure/img → immagine.
 */

type RisolviMedia = (id: number) => Promise<Immagine | null>;

const TAG_SCARTATI = new Set(["script", "style", "noscript", "template"]);
const TAG_CONTENITORE = new Set(["div", "section", "article", "main", "aside", "header", "footer", "body", "html"]);
const LARGHEZZA_DEFAULT = 1200;
const ALTEZZA_DEFAULT = 800;

const pulisci = (t: string) => t.replace(/\s+/g, " ").trim();

function numero(v?: string): number | undefined {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function allineamentoDi(img: HTMLElement): "sinistra" | "destra" | undefined {
  const classi = img.getAttribute("class") ?? "";
  if (/\balignleft\b/.test(classi)) return "sinistra";
  if (/\balignright\b/.test(classi)) return "destra";
  return undefined;
}

export async function htmlToBlocchi(html: string, risolviMedia?: RisolviMedia): Promise<Blocco[]> {
  const blocchi: Blocco[] = [];

  async function immagine(img: HTMLElement, didascalia?: string) {
    const src = img.getAttribute("src");
    if (!src) return;
    let larghezza = numero(img.getAttribute("width"));
    let altezza = numero(img.getAttribute("height"));
    let alt = img.getAttribute("alt") ?? "";
    let url = src;
    // Senza dimensioni nell'HTML si chiedono a WordPress (classe wp-image-ID): evita il salto di layout (CLS)
    if ((!larghezza || !altezza) && risolviMedia) {
      const id = numero(img.getAttribute("class")?.match(/wp-image-(\d+)/)?.[1]);
      const media = id ? await risolviMedia(id) : null;
      if (media) {
        larghezza ??= media.larghezza;
        altezza ??= media.altezza;
        alt = alt || media.alt;
        url = url || media.src;
      }
    }
    const allineamento = allineamentoDi(img);
    blocchi.push({
      tipo: "immagine",
      immagine: { src: url, alt, larghezza: larghezza ?? LARGHEZZA_DEFAULT, altezza: altezza ?? ALTEZZA_DEFAULT },
      ...(didascalia ? { didascalia } : {}),
      ...(allineamento ? { allineamento } : {}),
    });
  }

  async function elemento(el: HTMLElement) {
    const tag = el.tagName?.toLowerCase();
    if (!tag) return visita(el.childNodes);
    if (TAG_SCARTATI.has(tag)) return;

    switch (tag) {
      case "h1":
      case "h2": {
        const t = pulisci(el.textContent);
        if (t) blocchi.push({ tipo: "titolo", testo: t });
        return;
      }
      case "h3":
      case "h4":
      case "h5":
      case "h6": {
        const t = pulisci(el.textContent);
        if (t) blocchi.push({ tipo: "sottotitolo", testo: t });
        return;
      }
      case "p": {
        const t = pulisci(el.textContent);
        const immagini = el.querySelectorAll("img");
        // Immagine allineata (alignleft/alignright di WordPress): va prima del paragrafo, così il testo le scorre accanto
        const allineate = immagini.some((img) => allineamentoDi(img));
        if (allineate) for (const img of immagini) await immagine(img);
        if (t) blocchi.push({ tipo: "paragrafo", testo: t });
        if (!allineate) for (const img of immagini) await immagine(img);
        return;
      }
      case "blockquote": {
        const cite = el.querySelector("cite");
        const fonte = cite ? pulisci(cite.textContent) : undefined;
        cite?.remove();
        const t = pulisci(el.textContent);
        if (t) blocchi.push({ tipo: "citazione", testo: t, ...(fonte ? { fonte } : {}) });
        return;
      }
      case "ul":
      case "ol": {
        const voci = el
          .querySelectorAll("li")
          .map((li) => pulisci(li.textContent))
          .filter(Boolean);
        if (voci.length) blocchi.push({ tipo: "elenco", voci, ...(tag === "ol" ? { ordinato: true } : {}) });
        return;
      }
      case "figure": {
        const img = el.querySelector("img");
        if (img) {
          const d = el.querySelector("figcaption");
          await immagine(img, d ? pulisci(d.textContent) || undefined : undefined);
          return;
        }
        return visita(el.childNodes);
      }
      case "img":
        return immagine(el);
      case "br":
      case "hr":
        return;
      default: {
        if (TAG_CONTENITORE.has(tag)) return visita(el.childNodes);
        // Tag non previsto (tabelle, pre, iframe, span isolati…): il testo non si perde
        const t = pulisci(el.textContent);
        if (t) {
          console.warn(`[html-blocchi] tag <${tag}> non previsto: reso come paragrafo`);
          blocchi.push({ tipo: "paragrafo", testo: t });
        }
      }
    }
  }

  async function visita(nodi: Node[]) {
    for (const n of nodi) {
      if (n.nodeType === NodeType.ELEMENT_NODE) await elemento(n as HTMLElement);
      else if (n.nodeType === NodeType.TEXT_NODE) {
        const t = pulisci(n.text);
        if (t) blocchi.push({ tipo: "paragrafo", testo: t });
      }
    }
  }

  await visita(parse(html, { comment: false }).childNodes);
  return blocchi;
}
