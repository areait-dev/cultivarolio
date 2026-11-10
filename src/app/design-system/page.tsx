import type { Metadata } from "next";
import { Illustrazione, ILLUSTRAZIONI, Numero, Obiettivo, Pennellata, Territorio, Tratto } from "@/components/Blocchi";
import { HeroInterno } from "@/components/HeroInterno";
import m from "@/components/ModuloContatti.module.css";
import { Pulsante, type Variante } from "@/components/Pulsante";
import { Ruvido, type Forma, type Tono } from "@/components/Ruvido";
import { SchedaArticolo, SchedaDocumentario } from "@/components/Schede";
import { Sezione } from "@/components/Sezione";
import { Intro, Meta, Occhiello, Tenue, TitoloDisplay, TitoloSezione } from "@/components/Testo";
import { getArticoli, getDocumentari } from "@/lib/content";
import { contrasto } from "@/lib/contrasto";
import { metaPagina } from "@/lib/seo";
import s from "./ds.module.css";
import { leggiColori } from "./tokens";

export const metadata: Metadata = metaPagina({
  titolo: "Design system",
  descrizione: "Pagina di consultazione dei token e dei componenti del sito Cultivar.",
  percorso: "/design-system",
  noindex: true,
});

const cls = (nome: string) => nome.replace(/-/g, "_");

const PRIMITIVI: { nome: string; uso: string }[] = [
  { nome: "verde-oliva", uso: "Superficie verde, pulsante primario" },
  { nome: "verde-scuro", uso: "Hover del pulsante primario" },
  { nome: "bone", uso: "Superficie di base, testo su fondi scuri" },
  { nome: "bone-chiaro", uso: "Campi del modulo, scheda rialzata" },
  { nome: "kraft", uso: "Superficie alternata, schede" },
  { nome: "carbone", uso: "Testo, superficie profonda, bordi" },
  { nome: "lilla", uso: "Accento, pennellata, focus su fondi scuri" },
  { nome: "blu-baltico", uso: "Focus sui fondi chiari" },
  { nome: "inchiostro-tenue", uso: "Testo secondario su bone e kraft" },
  { nome: "bone-tenue", uso: "Testo secondario su fondi scuri" },
  { nome: "rosso-errore", uso: "Errori su fondi chiari" },
  { nome: "rosso-errore-chiaro", uso: "Errori su fondi scuri" },
  { nome: "illustrazione-salvia", uso: "Solo grafica" },
  { nome: "illustrazione-prugna", uso: "Solo grafica" },
  { nome: "illustrazione-ramo", uso: "Solo grafica" },
];

type Coppia = { fg: string; bg: string; uso: string; soglia: 3 | 4.5; tipo: "testo" | "grafica" };
const COPPIE: Coppia[] = [
  { fg: "carbone", bg: "bone", uso: "Testo corrente", soglia: 4.5, tipo: "testo" },
  { fg: "carbone", bg: "kraft", uso: "Testo su kraft", soglia: 4.5, tipo: "testo" },
  { fg: "carbone", bg: "lilla", uso: "Testo su lilla (anche il tenue)", soglia: 4.5, tipo: "testo" },
  { fg: "carbone", bg: "bone-chiaro", uso: "Testo nei campi", soglia: 4.5, tipo: "testo" },
  { fg: "inchiostro-tenue", bg: "bone", uso: "Testo tenue su bone", soglia: 4.5, tipo: "testo" },
  { fg: "inchiostro-tenue", bg: "kraft", uso: "Testo tenue su kraft", soglia: 4.5, tipo: "testo" },
  { fg: "bone", bg: "verde-oliva", uso: "Testo su verde", soglia: 4.5, tipo: "testo" },
  { fg: "bone", bg: "carbone", uso: "Testo su carbone", soglia: 4.5, tipo: "testo" },
  { fg: "bone", bg: "verde-scuro", uso: "Pulsante primario (hover)", soglia: 4.5, tipo: "testo" },
  { fg: "bone-tenue", bg: "verde-oliva", uso: "Tenue su verde", soglia: 4.5, tipo: "testo" },
  { fg: "bone-tenue", bg: "carbone", uso: "Tenue su carbone", soglia: 4.5, tipo: "testo" },
  { fg: "carbone", bg: "lilla-hover", uso: "Pulsante lilla (hover)", soglia: 4.5, tipo: "testo" },
  { fg: "rosso-errore", bg: "bone", uso: "Errore su bone", soglia: 4.5, tipo: "testo" },
  { fg: "rosso-errore", bg: "bone-chiaro", uso: "Errore su riquadro chiaro", soglia: 4.5, tipo: "testo" },
  { fg: "rosso-errore-chiaro", bg: "verde-oliva", uso: "Errore su verde", soglia: 4.5, tipo: "testo" },
  { fg: "rosso-errore-chiaro", bg: "carbone", uso: "Errore su carbone", soglia: 4.5, tipo: "testo" },
  { fg: "blu-baltico", bg: "bone", uso: "Anello di focus su bone", soglia: 3, tipo: "grafica" },
  { fg: "blu-baltico", bg: "kraft", uso: "Anello di focus su kraft", soglia: 3, tipo: "grafica" },
  { fg: "carbone", bg: "lilla", uso: "Anello di focus su lilla", soglia: 3, tipo: "grafica" },
  { fg: "lilla", bg: "verde-oliva", uso: "Anello di focus su verde", soglia: 3, tipo: "grafica" },
  { fg: "lilla", bg: "carbone", uso: "Anello di focus su carbone", soglia: 3, tipo: "grafica" },
  { fg: "carbone", bg: "bone-chiaro", uso: "Bordo dei campi del modulo", soglia: 3, tipo: "grafica" },
];

const SCALA = [
  ["2xs", "12 px", "Note, etichette del footer"],
  ["xs", "13 px", "Occhielli, meta"],
  ["sm", "14 px", "Testo di servizio, pulsanti piccoli"],
  ["base", "16 px", "Testo, campi del modulo"],
  ["md", "16 → 18 px", "Introduzioni, articolo"],
  ["lg", "18 → 20 px", "Lead"],
  ["xl", "22 → 28 px", "Titoli di scheda e di sezione"],
  ["2xl", "26 → 36 px", "Titoli intermedi"],
  ["3xl", "32 → 46 px", "Titoli display"],
  ["4xl", "38 → 64 px", "Titolo delle pagine interne"],
  ["5xl", "72 → 120 px", "Cifre grandi"],
] as const;

const FORME: Forma[] = ["scheda", "striscia", "pannello", "cornice"];
const TONI: Tono[] = ["verde", "carbone", "bone", "kraft", "lilla"];
const VARIANTI: Variante[] = ["primario", "chiaro", "secondario", "lilla"];
const SUPERFICI = ["bone", "kraft", "lilla", "verde", "carbone"] as const;

export default async function DesignSystem() {
  const colori = leggiColori();
  const [documentari, articoli] = await Promise.all([getDocumentari(), getArticoli(undefined, 2)]);

  return (
    <>
      <HeroInterno
        occhiello="Documentazione interna"
        titolo="Design system"
        intro="Token e componenti del sito. I colori e i contrasti sono letti da src/styles/tokens.css: se cambi un token, questa pagina si aggiorna."
        tono="kraft"
      />

      {/* ---------- Palette ---------- */}
      <Sezione labelledby="palette">
        <TitoloSezione id="palette" className={s.titolo}>
          Palette (token primitivi)
        </TitoloSezione>
        <ul className={`griglia-4 ${s.elenco}`} role="list">
          {PRIMITIVI.map(({ nome, uso }) => (
            <li key={nome} className={s.colore}>
              <span className={`${s.campione} ${s[`b_${cls(nome)}`]}`} aria-hidden="true" />
              <code>--{nome}</code>
              <span className={s.hex}>{colori[nome]}</span>
              <span className={s.nota}>{uso}</span>
            </li>
          ))}
        </ul>
      </Sezione>

      {/* ---------- Contrasti ---------- */}
      <Sezione tono="kraft" labelledby="contrasti">
        <TitoloSezione id="contrasti" className={s.titolo}>
          Contrasti
        </TitoloSezione>
        <Intro className={s.intro}>
          Soglie WCAG 2.2 AA: 4.5:1 per il testo (3:1 se è grande), 3:1 per elementi grafici e anelli di focus.
        </Intro>
        <div className={s.scorri} role="region" aria-label="Tabella dei contrasti" tabIndex={0}>
          <table className={s.tabella}>
            <thead>
              <tr>
                <th scope="col">Anteprima</th>
                <th scope="col">Uso</th>
                <th scope="col">Colori</th>
                <th scope="col">Rapporto</th>
                <th scope="col">Soglia</th>
                <th scope="col">Esito</th>
              </tr>
            </thead>
            <tbody>
              {COPPIE.map((c) => {
                const r = contrasto(colori[c.fg] ?? "#000000", colori[c.bg] ?? "#ffffff");
                const ok = r >= c.soglia;
                return (
                  <tr key={`${c.fg}-${c.bg}-${c.uso}`}>
                    <td>
                      <span className={`${s.anteprima} ${s[`f_${cls(c.fg)}`]} ${s[`b_${cls(c.bg)}`]}`} aria-hidden="true">
                        Aa
                      </span>
                    </td>
                    <td>{c.uso}</td>
                    <td>
                      <code>{c.fg}</code> su <code>{c.bg}</code>
                    </td>
                    <td>{r.toFixed(2)}:1</td>
                    <td>
                      {c.soglia}:1 ({c.tipo})
                    </td>
                    <td className={ok ? s.ok : s.ko}>{ok ? "Superato" : "Non superato"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Sezione>

      {/* ---------- Superfici ---------- */}
      <Sezione labelledby="superfici">
        <TitoloSezione id="superfici" className={s.titolo}>
          Superfici (token semantici)
        </TitoloSezione>
        <Intro className={s.intro}>
          Ogni classe <code>.superficie-*</code> ridefinisce <code>--superficie</code>, <code>--testo</code>,{" "}
          <code>--testo-tenue</code>, <code>--bordo</code> e <code>--focus</code>. I componenti usano solo questi.
        </Intro>
        <div className="griglia-3">
          {SUPERFICI.map((n) => (
            <div key={n} className={`superficie-${n} carta ${s.superficie}`}>
              <Meta>.superficie-{n}</Meta>
              <p>Testo principale con il suo colore.</p>
              <Tenue>Testo tenue della stessa superficie.</Tenue>
              <a href="#superfici">Un link con focus visibile</a>
              <div>
                <Pulsante variante={n === "verde" || n === "carbone" ? "chiaro" : "primario"} dimensione="piccolo" href="#superfici">
                  Pulsante
                </Pulsante>
              </div>
            </div>
          ))}
        </div>
      </Sezione>

      {/* ---------- Tipografia ---------- */}
      <Sezione tono="kraft" labelledby="tipografia">
        <TitoloSezione id="tipografia" className={s.titolo}>
          Tipografia
        </TitoloSezione>
        <div className="griglia-2">
          <div className={s.blocco}>
            <Meta>Display · BD Plakatt (esteso con punteggiatura e accenti)</Meta>
            <p className={s.famigliaDisplay}>storie di olio, storie di sicilia</p>
            <p className={s.nota}>Minuscolo solo via CSS: nel contenuto le maiuscole restano corrette.</p>
            <Meta as="h3">Glifi aggiunti (punteggiatura e accenti)</Meta>
            <p className={s.glifi}>? ! . , : ; … ’ “ ” ( ) – — / « »</p>
            <p className={s.glifi}>à è é ì ò ù À È É Ì Ò Ù</p>
            <p className={s.glifi}>Cosa? Dove?! È l’olio d’Oliva: “IGP”, (Sicilia).</p>
          </div>
          <div className={s.blocco}>
            <Meta>Testo · Poppins 400 / 500 / 600 / 700</Meta>
            <p className={s.famigliaSans}>Un viaggio nella Sicilia dell’olio extravergine d’oliva.</p>
            <p className={s.nota}>Corsivo 400 disponibile.</p>
          </div>
        </div>
        <table className={`${s.tabella} ${s.tipo}`}>
          <caption className="sr-only">Scala tipografica</caption>
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">Misura</th>
              <th scope="col">Esempio</th>
            </tr>
          </thead>
          <tbody>
            {SCALA.map(([k, mis, uso]) => (
              <tr key={k}>
                <td>
                  <code>--fs-{k}</code>
                </td>
                <td>{mis}</td>
                <td>
                  <span className={`${s[`fs_${k}`]} ${["2xl", "3xl", "4xl", "5xl"].includes(k) ? s.display : ""}`}>
                    {k === "5xl" ? "3" : "Olio d’oliva"}
                  </span>{" "}
                  <span className={s.nota}>{uso}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={s.componentiTesto}>
          <Occhiello>Occhiello</Occhiello>
          <TitoloSezione>Titolo di sezione</TitoloSezione>
          <TitoloDisplay dimensione="s">Display s</TitoloDisplay>
          <TitoloDisplay dimensione="m">Display m</TitoloDisplay>
          <TitoloDisplay dimensione="l">Display l</TitoloDisplay>
          <TitoloDisplay dimensione="xl">Display xl</TitoloDisplay>
          <Intro grande>Introduzione grande, per i lead.</Intro>
          <Intro>Introduzione: per i paragrafi di apertura.</Intro>
          <Tenue>Testo tenue per date e note.</Tenue>
          <Meta>Meta · Episodio 1</Meta>
        </div>
      </Sezione>

      {/* ---------- Spaziature ---------- */}
      <Sezione labelledby="spazi">
        <TitoloSezione id="spazi" className={s.titolo}>
          Spaziature (base 4)
        </TitoloSezione>
        <ul className={s.spazi} role="list">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <li key={n}>
              <code>--space-{n}</code>
              <span className={`${s.barra} ${s[`sp_${n}`]}`} aria-hidden="true" />
            </li>
          ))}
        </ul>
        <p className={s.nota}>
          Fluide: <code>--sezione-y</code>, <code>--sezione-y-stretta</code>, <code>--gutter</code>,{" "}
          <code>--gap-griglia</code>. Contenitore 1200 px (stretto 860 px); breakpoint 960 px e 760 px.
        </p>
      </Sezione>

      {/* ---------- Forme ---------- */}
      <Sezione tono="kraft" labelledby="forme">
        <TitoloSezione id="forme" className={s.titolo}>
          Forme
        </TitoloSezione>
        <div className={s.formeGriglia}>
          {FORME.map((f) => (
            <Ruvido key={f} forma={f} tono="verde" riquadro className={s.forma}>
              <Meta>{f}</Meta>
            </Ruvido>
          ))}
        </div>
        <div className={s.toniGriglia}>
          {TONI.map((t) => (
            <Ruvido key={t} forma="pannello" tono={t} riquadro>
              <Meta>tono {t}</Meta>
            </Ruvido>
          ))}
        </div>
        <div className={s.raggi}>
          <div className={`${s.raggio} ${s.rs}`}>
            <code>--radius-s</code>
          </div>
          <div className={`${s.raggio} ${s.rm}`}>
            <code>--radius-m</code>
          </div>
          <div className={`${s.raggio} ${s.rt}`}>
            <code>--radius-tondo</code>
          </div>
        </div>
        <Tratto className={s.tratto} />
        <div className={s.pennellataDemo}>
          <Pennellata>
            <Illustrazione src="/illustrazioni/oliva-colore.svg" larghezza={120} />
          </Pennellata>
        </div>
        <div className={s.blocchi}>
          <Numero cifra={3} titolo="territori" testo="Province di Ragusa, Catania e Trapani" />
          <Obiettivo verbo="Valorizzare" oggetto="un’eccellenza certificata">
            Far conoscere la qualità dell’Olio EVO Sicilia IGP.
          </Obiettivo>
          <Territorio luogo="Chiaramonte Gulfi (RG)" />
        </div>
        <div className={`superficie-bone carta ${s.texture}`}>
          <Meta>Carta: grana e fibre sopra la superficie</Meta>
        </div>
      </Sezione>

      {/* ---------- Pulsanti ---------- */}
      <Sezione labelledby="pulsanti">
        <TitoloSezione id="pulsanti" className={s.titolo}>
          Pulsanti
        </TitoloSezione>
        <div className={s.pulsanti}>
          <div className="superficie-bone carta">
            <div className={s.riga}>
              {VARIANTI.map((v) => (
                <Pulsante key={v} variante={v} freccia>
                  {v}
                </Pulsante>
              ))}
            </div>
            <div className={s.riga}>
              {VARIANTI.map((v) => (
                <Pulsante key={v} variante={v} dimensione="piccolo">
                  {v} piccolo
                </Pulsante>
              ))}
              <Pulsante disabled>Disabilitato</Pulsante>
            </div>
          </div>
          <div className="superficie-verde carta">
            <div className={s.riga}>
              <Pulsante variante="chiaro" freccia>
                chiaro
              </Pulsante>
              <Pulsante variante="secondario">secondario</Pulsante>
              <Pulsante variante="lilla">lilla</Pulsante>
            </div>
          </div>
          <div className="superficie-carbone carta">
            <div className={s.riga}>
              <Pulsante variante="chiaro" freccia>
                chiaro
              </Pulsante>
              <Pulsante variante="secondario">secondario</Pulsante>
            </div>
          </div>
        </div>
      </Sezione>

      {/* ---------- Schede ---------- */}
      <Sezione tono="kraft" labelledby="schede">
        <TitoloSezione id="schede" className={s.titolo}>
          Schede
        </TitoloSezione>
        <div className="griglia-3">
          {documentari.slice(0, 1).map((d) => (
            <SchedaDocumentario key={d.slug} doc={d} />
          ))}
          {articoli.map((a, i) => (
            <SchedaArticolo key={a.slug} articolo={a} tono={i ? "lilla" : "bone"} conImmagine />
          ))}
        </div>
      </Sezione>

      {/* ---------- Modulo ---------- */}
      <Sezione labelledby="modulo">
        <TitoloSezione id="modulo" className={s.titolo}>
          Modulo
        </TitoloSezione>
        <div className={s.moduloDemo}>
          <div className={m.campo}>
            <label htmlFor="ds-nome" className={m.etichetta}>
              Campo normale
            </label>
            <input id="ds-nome" placeholder="Nome e cognome" />
          </div>
          <div className={m.campo} data-errore="">
            <label htmlFor="ds-email" className={m.etichetta}>
              Campo con errore
            </label>
            <input id="ds-email" defaultValue="nome@dominio" aria-invalid="true" aria-describedby="ds-email-errore" />
            <p id="ds-email-errore" className={m.errore}>
              Inserisci un indirizzo email valido.
            </p>
          </div>
          <fieldset className={m.fieldset}>
            <legend className={m.etichetta}>Scelta</legend>
            <div className={m.scelte}>
              {["Consumatore", "Buyer", "Altro"].map((p, i) => (
                <label key={p} className={m.scelta}>
                  <input type="radio" name="ds-profilo" defaultChecked={i === 0} />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className={m.consenso}>
            <input type="checkbox" />
            <span>Casella di consenso con testo di accompagnamento.</span>
          </label>
        </div>
      </Sezione>

      {/* ---------- Illustrazioni ---------- */}
      <Sezione tono="kraft" labelledby="illustrazioni">
        <TitoloSezione id="illustrazioni" className={s.titolo}>
          Illustrazioni
        </TitoloSezione>
        <ul className={`griglia-4 ${s.elenco}`} role="list">
          {ILLUSTRAZIONI.map((src) => (
            <li key={src} className={s.illustrazione}>
              <div className={`${src.includes("-bone") ? "superficie-carbone" : "superficie-bone"} carta ${s.riquadroIll}`}>
                <Illustrazione src={src} larghezza={110} />
              </div>
              <code>{src.replace("/illustrazioni/", "")}</code>
            </li>
          ))}
        </ul>
      </Sezione>
    </>
  );
}
