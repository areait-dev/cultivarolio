import type { Metadata } from "next";
import { Illustrazione, Pennellata } from "@/components/Blocchi";
import { JsonLd } from "@/components/JsonLd";
import { Pulsante } from "@/components/Pulsante";
import { Ruvido } from "@/components/Ruvido";
import { SchedaArticolo, SchedaDocumentario } from "@/components/Schede";
import { LinkTesto, Sezione, TestaSezione } from "@/components/Sezione";
import { Social } from "@/components/Social";
import { Intro, TitoloDisplay, TitoloSezione } from "@/components/Testo";
import { getArticoli, getDocumentari } from "@/lib/content";
import { assoluto, metaPagina } from "@/lib/seo";
import { site } from "@/lib/site";
import { testi } from "@/lib/testi";
import s from "./page.module.css";

// ISR: la home legge documentari e articoli dal CMS
export const revalidate = 3600;

export const metadata: Metadata = metaPagina({ descrizione: testi.home.sottotitolo, percorso: "/" });

export default async function Home() {
  const [documentari, articoli] = await Promise.all([getDocumentari(), getArticoli(undefined, 3)]);
  const t = testi.home;
  const toniArticolo = ["kraft", "lilla", "kraft"] as const;

  // Il progetto è di Promotergroup: l'organizzazione è dichiarata una volta sola e richiamata dal sito
  const dati = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": assoluto("/#organizzazione"),
      name: site.nome,
      url: assoluto("/"),
      email: site.titolare.email,
      parentOrganization: { "@type": "Organization", name: site.titolare.ragioneSociale },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": assoluto("/#sito"),
      name: site.titoloCompleto,
      url: assoluto("/"),
      inLanguage: "it",
      description: site.descrizione,
      publisher: { "@id": assoluto("/#organizzazione") },
    },
  ];

  return (
    <>
      <JsonLd dati={dati} />
      <section className={`${s.hero} superficie-verde carta`}>
        <div className={`contenitore ${s.heroGriglia}`}>
          <div>
            <h1 className={s.titolo}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={s.logo} src="/logo/cultivar-bone.svg" alt="Cultivar" width={520} height={130} fetchPriority="high" />
              <span className="sr-only">. </span>
              <span className={s.sottotitoloDisplay}>{t.titoloResto}</span>
            </h1>
            <p className={s.heroTesto}>{t.sottotitolo}</p>
            <div className="azioni">
              <Pulsante href="/documentari" variante="chiaro">
                {t.pulsanteDocumentari}
              </Pulsante>
              <Pulsante href="/il-progetto" variante="secondario">
                {t.pulsanteProgetto}
              </Pulsante>
            </div>
          </div>
          <div className={s.heroImmagine}>
            <Illustrazione src="/illustrazioni/ramo-olive-bone.svg" larghezza={400} />
          </div>
        </div>
      </section>

      <Sezione labelledby="breve">
        <div className="griglia-2">
          <div className={s.colonna}>
            <TitoloSezione id="breve">{t.breve.titolo}</TitoloSezione>
            {t.breve.paragrafi.map((p) => (
              <Intro key={p}>{p}</Intro>
            ))}
            <p className={s.sintesi}>
              Tre documentari da 15–20 minuti, tre territori: le province di Ragusa, Catania e Trapani.
            </p>
            <div>
              <Pulsante href="/il-progetto">
                {t.breve.pulsante}
              </Pulsante>
            </div>
          </div>
          <div className={s.centro}>
            <Pennellata>
              <Illustrazione src="/illustrazioni/ramo-colore.svg" larghezza={280} />
            </Pennellata>
          </div>
        </div>
      </Sezione>

      <Sezione tono="kraft" labelledby="documentari">
        <TestaSezione azione={<Pulsante href="/documentari">{t.documentari.pulsante}</Pulsante>}>
          <TitoloDisplay id="documentari" dimensione="l">
            {t.documentari.titolo}
          </TitoloDisplay>
          <Intro>{t.documentari.intro}</Intro>
        </TestaSezione>
        <div className={`griglia-3 ${s.sfalsata}`}>
          {documentari.map((d) => (
            <SchedaDocumentario key={d.slug} doc={d} />
          ))}
        </div>
      </Sezione>

      <Sezione labelledby="blog">
        <div className={s.centro}>
          <Illustrazione src="/illustrazioni/foglie-verde.svg" larghezza={300} />
        </div>
        <TestaSezione azione={<LinkTesto href="/blog">{t.blog.link}</LinkTesto>}>
          <TitoloDisplay id="blog" dimensione="l">
            {t.blog.titolo}
          </TitoloDisplay>
        </TestaSezione>
        <div className={`griglia-3 ${s.sfalsata}`}>
          {articoli.map((a, i) => (
            <SchedaArticolo key={a.slug} articolo={a} tono={toniArticolo[i % 3]} />
          ))}
        </div>
      </Sezione>

      <Sezione senzaSopra>
        <Ruvido forma="pannello" tono="verde" className={s.invito}>
          <div className={s.invitoTesto}>
            <TitoloDisplay as="p" dimensione="m">
              {t.invito.testo}
            </TitoloDisplay>
            <div className="azioni">
              <Pulsante href={site.social.youtube} variante="chiaro">
                {t.invito.pulsante}
              </Pulsante>
              <Social />
            </div>
          </div>
          <div className={`${s.invitoImmagine} solo-desktop`}>
            <Illustrazione src="/illustrazioni/oliva-bone.svg" larghezza={150} />
          </div>
        </Ruvido>
      </Sezione>
    </>
  );
}
