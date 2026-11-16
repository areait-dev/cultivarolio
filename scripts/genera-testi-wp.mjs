#!/usr/bin/env node
/**
 * Genera contenuti-wp/testi-pagine.md: i testi attuali del sito (src/lib/testi.ts e src/lib/site.ts),
 * campo per campo, pronti da copiare nelle pagine WordPress (campi ACF).
 *
 *   node scripts/genera-testi-wp.mjs        (richiede Node 22.18+ / 24, che legge i .ts direttamente)
 *
 * I REFUSO del docx sono lasciati com'erano: vanno corretti dal cliente direttamente in WordPress.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const radice = join(dirname(fileURLToPath(import.meta.url)), "..");
const { testiDefault: t } = await import(pathToFileURL(join(radice, "src/lib/testi.ts")).href);
const { site } = await import(pathToFileURL(join(radice, "src/lib/site.ts")).href);

const righe = [];
const pagina = (slug, titolo) => righe.push(`\n## Pagina «${titolo}» — slug \`${slug}\`\n`);
const gruppo = (nome) => righe.push(`\n### Gruppo «${nome}»\n`);
const campo = (etichetta, valore) => {
  righe.push(`**${etichetta}**\n`);
  righe.push("```text\n" + valore + "\n```\n");
};

righe.push("# Testi da inserire in WordPress\n");
righe.push(
  "Generato da `scripts/genera-testi-wp.mjs`. Ogni blocco va nel campo ACF indicato della pagina con lo slug indicato.\n" +
    "I campi lasciati vuoti ricadono sui testi di riserva del codice, quindi si può partire anche da una sola pagina.\n",
);

pagina("home", "Home");
campo("Titolo (dopo «Cultivar.»)", t.home.titoloResto);
campo("Sottotitolo", t.home.sottotitolo);
campo("Pulsante documentari", t.home.pulsanteDocumentari);
campo("Pulsante progetto", t.home.pulsanteProgetto);
gruppo("Il progetto in breve");
campo("Titolo", t.home.breve.titolo);
campo("Paragrafi (uno per riga)", t.home.breve.paragrafi.join("\n"));
campo("Pulsante", t.home.breve.pulsante);
gruppo("Didascalie dei numeri");
campo("Sotto «N territori»", t.home.numeri.territori);
campo("Sotto «N documentari»", t.home.numeri.documentari);
gruppo("Sezione documentari");
campo("Titolo", t.home.documentari.titolo);
campo("Introduzione", t.home.documentari.intro);
campo("Pulsante", t.home.documentari.pulsante);
gruppo("Sezione blog");
campo("Titolo", t.home.blog.titolo);
campo("Testo del link", t.home.blog.link);

pagina("il-progetto", "Il progetto");
campo("Titolo", t.progetto.titolo);
campo("Introduzione", t.progetto.introduzione);
gruppo("Gli obiettivi");
campo("Titolo", t.progetto.obiettivi.titolo);
campo("Voci (Verbo | Oggetto | Descrizione)", t.progetto.obiettivi.voci.map((v) => `${v.verbo} | ${v.oggetto} | ${v.testo}`).join("\n"));
gruppo("Cosa raccontano le storie");
campo("Titolo", t.progetto.storie.titolo);
campo("Voci (Titolo | Descrizione)", t.progetto.storie.voci.map((v) => `${v.titolo} | ${v.testo}`).join("\n"));
gruppo("I territori del racconto");
campo("Titolo", t.progetto.territori.titolo);
campo("Testo", t.progetto.territori.testo);
gruppo("Chi realizza il progetto");
campo("Titolo", t.progetto.chi.titolo);
campo("Realizzazione", t.progetto.chi.realizzazione);
campo("Consorzio", t.progetto.chi.consorzio);

pagina("documentari", "Documentari");
campo("Titolo", t.documentari.titolo);
campo("Introduzione", t.documentari.intro);
campo("Invito a iscriversi", t.documentari.invito);
campo("Pulsante", t.documentari.pulsante);

pagina("blog", "Blog");
campo("Titolo", t.blog.titolo);
campo("Introduzione", t.blog.intro);
campo("Titolo dell'elenco articoli", t.blog.elenco);

pagina("contatti", "Contatti");
campo("Titolo", t.contatti.titolo);
campo("Introduzione", t.contatti.intro);
campo("Profili (uno per riga)", t.contatti.profili.join("\n"));

pagina("opzioni-globali", "Opzioni globali");
gruppo("Sito");
campo("Nome del sito", site.nome);
campo("Titolo completo", site.titoloCompleto);
campo("Descrizione", site.descrizione);
gruppo("Social");
for (const [k, v] of Object.entries(site.social)) campo(k, v);
gruppo("Titolare e recapiti");
campo("Ragione sociale", site.titolare.ragioneSociale);
campo("Sede", site.titolare.sede);
campo("Telefono", site.titolare.telefono);
campo("Email", site.titolare.email);
campo("Partita IVA", site.titolare.piva);
gruppo("Cofinanziamento");
campo("Testo obbligatorio del cofinanziamento", site.cofinanziamento.testo);
campo("CUP (obbligatorio prima della pubblicazione)", "da inserire");
righe.push("**Logo Regione Siciliana**: carica `public/logo/regione-siciliana.svg` nella libreria media e sceglilo qui.\n");
gruppo("Invito al canale YouTube");
campo("Testo", t.home.invito.testo);
campo("Pulsante", t.home.invito.pulsante);

const documentari = [
  ["Chiaramonte Gulfi", 1, "Chiaramonte Gulfi (RG)", "Frantoi Cutrera srl", "grappolo-carbone"],
  ["Mirabella Imbaccari", 2, "Mirabella Imbaccari (CT)", "Frantoi Beretta", "ramo-olive-carbone"],
  ["Partanna", 3, "Partanna (TP)", "Olivoil srl – Oleificio Geraci", "ramo-colore"],
];
righe.push("\n## Documentari (CPT «Documentari»)\n");
righe.push("| Titolo | Ordine | Luogo | Partner | Illustrazione | Segnaposto |\n|---|---|---|---|---|---|");
for (const [titolo, ordine, luogo, partner, illustrazione] of documentari) {
  righe.push(`| ${titolo} | ${ordine} | ${luogo} | ${partner} | ${illustrazione} | sì |`);
}
righe.push(
  "\nDescrizione di ogni episodio: «Episodio in lavorazione, in collaborazione con <partner>.» " +
    "Durata e ID YouTube restano vuoti finché il video non è pronto.\n",
);

mkdirSync(join(radice, "contenuti-wp"), { recursive: true });
writeFileSync(join(radice, "contenuti-wp/testi-pagine.md"), righe.join("\n") + "\n", "utf8");
console.log("contenuti-wp/testi-pagine.md scritto");
