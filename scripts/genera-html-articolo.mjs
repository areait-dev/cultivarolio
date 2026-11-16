#!/usr/bin/env node
/**
 * Genera contenuti-wp/articolo-28-cultivar.html: il corpo dell'articolo «Le 28 cultivar…» come HTML
 * da incollare nell'editor di WordPress (vista "Codice" / blocco "HTML personalizzato").
 *
 *   node scripts/genera-html-articolo.mjs
 *
 * Legge i blocchi da src/lib/content/adapters/articolo-28-cultivar.ts e li converte:
 * titolo → h2 · sottotitolo → h3 · paragrafo → p · citazione → blockquote · elenco → ul/ol · immagine → figure.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const radice = join(dirname(fileURLToPath(import.meta.url)), "..");
const sorgente = readFileSync(join(radice, "src/lib/content/adapters/articolo-28-cultivar.ts"), "utf8");
const inizio = sorgente.indexOf("= [") + 2;
const fine = sorgente.lastIndexOf("];") + 1;
const blocchi = JSON.parse(sorgente.slice(inizio, fine));

const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const html = blocchi
  .map((b) => {
    switch (b.tipo) {
      case "paragrafo":
        return `<p>${esc(b.testo)}</p>`;
      case "titolo":
        return `<h2>${esc(b.testo)}</h2>`;
      case "sottotitolo":
        return `<h3>${esc(b.testo)}</h3>`;
      case "citazione":
        return `<blockquote><p>${esc(b.testo)}</p>${b.fonte ? `<cite>${esc(b.fonte)}</cite>` : ""}</blockquote>`;
      case "elenco": {
        const tag = b.ordinato ? "ol" : "ul";
        return `<${tag}>\n${b.voci.map((v) => `  <li>${esc(v)}</li>`).join("\n")}\n</${tag}>`;
      }
      case "immagine":
        return `<figure><img src="${b.immagine.src}" alt="${esc(b.immagine.alt)}" width="${b.immagine.larghezza}" height="${b.immagine.altezza}">${b.didascalia ? `<figcaption>${esc(b.didascalia)}</figcaption>` : ""}</figure>`;
      default:
        throw new Error(`Blocco sconosciuto: ${b.tipo}`);
    }
  })
  .join("\n\n");

mkdirSync(join(radice, "contenuti-wp"), { recursive: true });
writeFileSync(join(radice, "contenuti-wp/articolo-28-cultivar.html"), html + "\n", "utf8");
console.log(`${blocchi.length} blocchi → contenuti-wp/articolo-28-cultivar.html`);
