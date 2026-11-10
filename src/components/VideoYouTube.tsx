"use client";

import { useState } from "react";
import { useConsenso } from "./Consenso";
import { PITTOGRAMMA } from "./Blocchi";
import { IconaPlay } from "./Icone";
import type { Immagine } from "@/lib/content/types";
import s from "./VideoYouTube.module.css";

type Props = {
  titolo: string;
  youtubeId?: string;
  copertina?: Immagine;
  durata?: string;
};

/**
 * Video "a facciata": finché non si preme play non viene caricato nulla da YouTube
 * (zero peso, zero cookie). Al click: se c'è consenso parte subito,
 * altrimenti chiede conferma per quel singolo video. Usa youtube-nocookie.
 */
export function VideoYouTube({ titolo, youtubeId, copertina, durata }: Props) {
  const { preferenze, salva } = useConsenso();
  const [fase, setFase] = useState<"facciata" | "conferma" | "video">("facciata");
  const consenso = preferenze?.mediaEsterni === "accettato";

  const fondo = (
    <>
      {copertina ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={s.copertina} src={copertina.src} alt="" width={copertina.larghezza} height={copertina.altezza} loading="lazy" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={s.illustrazione} src={PITTOGRAMMA} alt="" loading="lazy" />
      )}
    </>
  );

  if (!youtubeId) {
    return (
      <div className={s.video}>
        {fondo}
        <p className={s.etichetta}>Video in arrivo</p>
      </div>
    );
  }

  if (fase === "video") {
    return (
      <div className={s.video}>
        <iframe
          className={s.iframe}
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          title={titolo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (fase === "conferma") {
    return (
      <div className={`${s.video} ${s.conferma}`}>
        <p>Il video è ospitato da YouTube, che può impostare cookie propri.</p>
        <div className={s.scelte}>
          <button type="button" className={s.bottone} onClick={() => setFase("video")}>
            Carica questo video
          </button>
          <button
            type="button"
            className={s.bottoneSecondario}
            onClick={() => {
              salva("accettato");
              setFase("video");
            }}
          >
            Accetta sempre
          </button>
          <a className={s.link} href={`https://www.youtube.com/watch?v=${youtubeId}`} target="_blank" rel="noopener noreferrer">
            Guarda su YouTube
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={s.video}>
      {fondo}
      <button type="button" className={s.play} onClick={() => setFase(consenso ? "video" : "conferma")}>
        <span className={s.cerchio}>
          <IconaPlay width={30} height={30} />
        </span>
        <span>
          Guarda <span className="sr-only">il documentario “{titolo}”</span>
        </span>
      </button>
      {durata && <span className={s.durata}>{durata}</span>}
    </div>
  );
}
