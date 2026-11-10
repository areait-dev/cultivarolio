import type { ReactNode } from "react";
import { Illustrazione } from "./Blocchi";
import { TitoloDisplay } from "./Testo";
import s from "./HeroInterno.module.css";

type Props = {
  occhiello?: ReactNode;
  titolo: string;
  intro?: ReactNode;
  decorazione?: { src: string; larghezza: number };
  tono?: "verde" | "kraft";
  stretto?: boolean;
  /** Titolo lungo: lascia più larghezza così va su due righe */
  titoloAmpio?: boolean;
  children?: ReactNode;
};

/** Apertura delle pagine interne: occhiello (breadcrumb), titolo display, intro. */
export function HeroInterno({ occhiello, titolo, intro, decorazione, tono = "verde", stretto, titoloAmpio, children }: Props) {
  return (
    <section className={`${s.hero} superficie-${tono} carta`}>
      <div className={`contenitore ${stretto ? "contenitore--stretto" : ""} ${decorazione ? s.conImmagine : ""}`}>
        <div>
          {occhiello && <div className={s.occhiello}>{occhiello}</div>}
          <TitoloDisplay as="h1" dimensione="xl" className={titoloAmpio ? `${s.titolo} ${s.titoloAmpio}` : s.titolo}>
            {titolo}
          </TitoloDisplay>
          {intro && <p className={s.intro}>{intro}</p>}
          {children && <div className={s.extra}>{children}</div>}
        </div>
        {decorazione && (
          <div className={s.deco}>
            <Illustrazione src={decorazione.src} larghezza={decorazione.larghezza} />
          </div>
        )}
      </div>
    </section>
  );
}
