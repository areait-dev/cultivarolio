import { HTMLElement, Node, NodeType, parse } from "node-html-parser";

/**
 * Pulizia dell'HTML che arriva da WordPress (pagine legali) prima di mostrarlo.
 * È una lista di permessi: tag e attributi non elencati vengono tolti (il testo resta,
 * tranne per script/style). Niente event handler, niente javascript: negli indirizzi.
 */

const TAG_OK = new Set([
  "h2", "h3", "h4", "p", "br", "a", "strong", "b", "em", "i", "code", "ul", "ol", "li", "blockquote",
]);
const TAG_VIA_CON_CONTENUTO = new Set(["script", "style", "noscript", "template", "iframe", "object", "embed"]);
const PROTOCOLLI_OK = /^(https?:|mailto:|tel:|\/|#)/i;

const escapeTesto = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttributo = (t: string) => escapeTesto(t).replace(/"/g, "&quot;");

function serializza(nodo: Node): string {
  if (nodo.nodeType === NodeType.TEXT_NODE) {
    // rawText è già testo HTML con le entità: si rimette in forma sicura decodificando e ri-codificando
    return escapeTesto(nodo.text);
  }
  if (nodo.nodeType !== NodeType.ELEMENT_NODE) return "";
  const el = nodo as HTMLElement;
  const tag = el.tagName?.toLowerCase();
  if (!tag) return el.childNodes.map(serializza).join("");
  if (TAG_VIA_CON_CONTENUTO.has(tag)) return "";
  const figli = el.childNodes.map(serializza).join("");
  if (!TAG_OK.has(tag)) return figli;
  if (tag === "br") return "<br>";
  if (tag === "a") {
    const href = (el.getAttribute("href") ?? "").trim();
    if (!PROTOCOLLI_OK.test(href)) return figli;
    const esterno = /^https?:/i.test(href);
    const attr = `href="${escapeAttributo(href)}"` + (esterno ? ' target="_blank" rel="noopener noreferrer"' : "");
    return `<a ${attr}>${figli}${esterno ? '<span class="sr-only"> (si apre in una nuova scheda)</span>' : ""}</a>`;
  }
  return `<${tag}>${figli}</${tag}>`;
}

export function sanitizzaHtml(html: string): string {
  return parse(html, { comment: false }).childNodes.map(serializza).join("").trim();
}
