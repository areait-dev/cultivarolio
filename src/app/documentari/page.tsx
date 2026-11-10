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
import { site } from "@/lib/site";
import { testi } from "@/lib/testi";
import s from "./pagina.module.css";

// ISR: gli episodi arrivano dal CMS
export const revalidate = 3600;

export const metadata: Metadata = metaPagina({
  titolo: "Documentari",
  descrizione: testi.documentari.intro,
  percorso: "/documentari",
});

export default async function Documentari() {
  const documentari = await getDocumentari();
  const t = testi.documentari;

  const dati = documentari.map((d) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: d.titolo,
    description: d.descrizione,
    url: assoluto(`/documentari#${d.slug}`),
    duration: durataIso(d.durata),
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
              <TitoloDisplay as="h2" id={`${d.slug}-titolo`} dimensione="l">
                {d.titolo}
              </TitoloDisplay>
              <dl className={s.scheda}>
                <dt>{t.etichette.territorio}</dt>
                <dd>{d.luogo}</dd>
                <dt>{t.etichette.durata}</dt>
                <dd>{d.durata}</dd>
              </dl>
              <p>{d.descrizione}</p>
            </div>
          </article>
        ))}
      </Sezione>

      <InvitoCanale />
    </>
  );
}
