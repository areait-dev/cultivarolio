import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Legge i colori primitivi direttamente da src/styles/tokens.css:
 * la pagina /design-system non può quindi mostrare valori diversi da quelli usati dal sito.
 */
export function leggiColori(): Record<string, string> {
  const css = readFileSync(join(process.cwd(), "src/styles/tokens.css"), "utf8");
  const colori: Record<string, string> = {};
  for (const m of css.matchAll(/^\s*--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/gm)) {
    colori[m[1]] = m[2].toLowerCase();
  }
  // il lilla "premuto" del pulsante è definito nel CSS del pulsante
  colori["lilla-hover"] ??= "#b596bb";
  return colori;
}
