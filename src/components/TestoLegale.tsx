import { createElement, type ReactNode } from "react";
import { HTMLElement, Node, NodeType, parse } from "node-html-parser";
import { SEGNAPOSTO_CONSENSO } from "@/lib/dati-sito";
import { RiapriConsenso } from "./Consenso";
import { ProsaTesto } from "./Prosa";

/**
 * Testo delle note legali scritto in WordPress. L'HTML arriva già ripulito (lib/html-sicuro.ts) e qui
 * diventa elementi React (nessun dangerouslySetInnerHTML). Il segnaposto {{riapri_consenso}}
 * diventa il pulsante che riapre le preferenze sui cookie, anche in mezzo a una frase.
 */

const TAG = new Set(["h2", "h3", "h4", "p", "br", "a", "strong", "b", "em", "i", "code", "ul", "ol", "li", "blockquote", "span"]);

function nodoReact(n: Node, chiave: string): ReactNode {
  if (n.nodeType === NodeType.TEXT_NODE) {
    const parti = n.text.split(SEGNAPOSTO_CONSENSO);
    return parti.flatMap((p, i) => (i < parti.length - 1 ? [p, <RiapriConsenso key={`${chiave}-${i}`} />] : [p]));
  }
  if (n.nodeType !== NodeType.ELEMENT_NODE) return null;
  const el = n as HTMLElement;
  const tag = el.tagName?.toLowerCase();
  if (!tag) return el.childNodes.map((f, i) => nodoReact(f, `${chiave}.${i}`));
  const figli = el.childNodes.map((f, i) => nodoReact(f, `${chiave}.${i}`));
  if (!TAG.has(tag)) return figli;
  if (tag === "br") return createElement("br", { key: chiave });
  const proprieta: Record<string, string> = { key: chiave };
  if (tag === "a") {
    const href = el.getAttribute("href");
    if (href) proprieta.href = href;
    const target = el.getAttribute("target");
    if (target === "_blank") {
      proprieta.target = "_blank";
      proprieta.rel = "noopener noreferrer";
    }
  }
  if (tag === "span" && el.getAttribute("class") === "sr-only") proprieta.className = "sr-only";
  return createElement(tag, proprieta, ...figli);
}

export function TestoLegale({ html }: { html: string }) {
  return <ProsaTesto>{parse(html, { comment: false }).childNodes.map((n, i) => nodoReact(n, String(i)))}</ProsaTesto>;
}
