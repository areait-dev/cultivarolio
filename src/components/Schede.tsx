import Link from "next/link";
import type { ArticoloSintesi, Documentario } from "@/lib/content/types";
import { formattaData } from "@/lib/format";
import { PITTOGRAMMA } from "./Blocchi";
import { IconaPlay } from "./Icone";
import { Ruvido } from "./Ruvido";
import s from "./Schede.module.css";

/** Scheda episodio per le anteprime (home): porta alla pagina documentari. */
export function SchedaDocumentario({ doc, livello = 3 }: { doc: Documentario; livello?: 2 | 3 }) {
  const H = `h${livello}` as "h2" | "h3";
  return (
    <article className={s.scheda}>
      <div className={s.media} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={s.mediaIllustrazione} src={PITTOGRAMMA} alt="" loading="lazy" />
        <span className={s.play}>
          <IconaPlay width={28} height={28} />
        </span>
        <span className={s.durata}>{doc.durata}</span>
      </div>
      <p className={s.meta}>
        {doc.luogo}, episodio {doc.numero}
      </p>
      <H className={s.titolo}>
        <Link href={`/documentari#${doc.slug}`} className={s.link}>
          {doc.titolo}
        </Link>
      </H>
    </article>
  );
}

/** Scheda articolo su riquadro ruvido. */
export function SchedaArticolo({
  articolo,
  tono = "kraft",
  conImmagine = false,
  livello = 3,
}: {
  articolo: ArticoloSintesi;
  tono?: "kraft" | "lilla" | "bone";
  conImmagine?: boolean;
  livello?: 2 | 3;
}) {
  const H = `h${livello}` as "h2" | "h3";
  return (
    <Ruvido as="article" forma="pannello" tono={tono} className={s.articolo}>
      {conImmagine && (
        <div className={s.artMedia} aria-hidden="true">
          {articolo.copertina ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={articolo.copertina.src}
              alt=""
              width={articolo.copertina.larghezza}
              height={articolo.copertina.altezza}
              className={s.artCopertina}
              loading="lazy"
            />
          ) : articolo.illustrazione ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={articolo.illustrazione} alt="" className={s.artIllustrazione} loading="lazy" />
          ) : null}
        </div>
      )}
      <p className={s.meta}>{articolo.categoria.nome}</p>
      <H className={`${s.titolo} ${s.titoloArticolo}`}>
        <Link href={`/blog/${articolo.slug}`} className={s.link}>
          {articolo.titolo}
        </Link>
      </H>
      <p className={s.testo}>{articolo.estratto}</p>
      <p className={`${s.meta} ${s.data}`}>
        <time dateTime={articolo.data}>{formattaData(articolo.data)}</time>
      </p>
    </Ruvido>
  );
}
