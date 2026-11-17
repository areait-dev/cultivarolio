import type { Metadata } from "next";
import { PITTOGRAMMA } from "@/components/Blocchi";
import { HeroInterno } from "@/components/HeroInterno";
import { InvitoCanale } from "@/components/InvitoCanale";
import { JsonLd } from "@/components/JsonLd";
import { Sezione } from "@/components/Sezione";
import { Meta, TitoloDisplay } from "@/components/Testo";
import { VideoYouTube } from "@/components/VideoYouTube";
import { getDocumentari } from "@/lib/content";
import { durataIso } from "@/lib/format";
import { assoluto, metaPagina } from "@/lib/seo";
import { getSeoPagina, getSito, getTesti } from "@/lib/dati-sito";
import s from "./pagina.module.css";

// ID dello short di @cultivarolio (la parte dopo /shorts/ nell'URL). Vuoto = sezione nascosta.
const SHORT_YOUTUBE_ID = "EEx6FPduBBs";

// ISR: gli episodi arrivano dal CMS
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [testi, seo] = await Promise.all([getTesti(), getSeoPagina("documentari")]);
  return metaPagina({ titolo: "Documentari", descrizione: testi.documentari.intro, percorso: "/documentari", seo });
}

export default async function Documentari() {
  const [documentari, testi, site] = await Promise.all([getDocumentari(), getTesti(), getSito()]);
  const t = testi.documentari;

  const dati = documentari.map((d) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: d.titolo,
    description: d.descrizione,
    url: assoluto(`/documentari#${d.slug}`),
    ...(d.durata ? { duration: durataIso(d.durata) } : {}),
    contentLocation: { "@type": "Place", name: d.luogo },
    inLanguage: "it",
    publisher: { "@type": "Organization", name: site.titolare.ragioneSociale },
    // Google richiede miniatura e data di caricamento: arrivano insieme al video definitivo
    ...(d.youtubeId
      ? {
          embedUrl: `https://www.youtube-nocookie.com/embed/${d.youtubeId}`,
          thumbnailUrl: d.copertina ? assoluto(d.copertina.src) : `https://i.ytimg.com/vi/${d.youtubeId}/hqdefault.jpg`,
        }
      : d.copertina
        ? { thumbnailUrl: assoluto(d.copertina.src) }
        : {}),
    ...(d.dataPubblicazione ? { uploadDate: d.dataPubblicazione } : {}),
  }));

  return (
    <>
      <JsonLd dati={dati} />
      <HeroInterno
        occhiello="Documentari"
        titolo={t.titolo}
        intro={t.intro}
        decorazione={{ src: PITTOGRAMMA, larghezza: 340 }}
      />

      <Sezione className={s.elenco}>
        {documentari.map((d) => (
          <article key={d.slug} id={d.slug} className={s.episodio} aria-labelledby={`${d.slug}-titolo`}>
            <VideoYouTube
              titolo={d.titolo}
              youtubeId={d.youtubeId}
              copertina={d.copertina}
              durata={d.durata}
            />
            <div className={s.testo}>
              <span className={s.numero} aria-hidden="true">
                {d.numero}
              </span>
              <Meta>Episodio {d.numero}</Meta>
              <TitoloDisplay as="h2" id={`${d.slug}-titolo`} dimensione="l" minuscolo={false}>
                {d.titolo}
              </TitoloDisplay>
              <dl className={s.scheda}>
                <dt>{t.etichette.territorio}</dt>
                <dd>{d.luogo}</dd>
                {d.durata ? (
                  <>
                    <dt>{t.etichette.durata}</dt>
                    <dd>{d.durata}</dd>
                  </>
                ) : (
                  <>
                    <dt>Stato</dt>
                    <dd>In arrivo</dd>
                  </>
                )}
              </dl>
              <p>{d.descrizione}</p>
            </div>
          </article>
        ))}
      </Sezione>

      {SHORT_YOUTUBE_ID && (
        <Sezione className={s.inBreve}>
          <div className={s.short}>
            <div>
              <VideoYouTube titolo="Cultivar in breve" youtubeId={SHORT_YOUTUBE_ID} />
            </div>
            <div className={s.testo}>
              <Meta>In breve</Meta>
              <TitoloDisplay as="h2" dimensione="l" minuscolo={false}>
                Un assaggio in pochi secondi
              </TitoloDisplay>
              <p>Gli short del nostro canale: il racconto dell’olio in formato breve.</p>
            </div>
          </div>
        </Sezione>
      )}

      <InvitoCanale />
    </>
  );
}
