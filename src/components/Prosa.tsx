import type { ReactNode } from "react";
import type { Blocco } from "@/lib/content/types";
import { Ruvido } from "./Ruvido";
import s from "./Prosa.module.css";

/** Rende il corpo dell'articolo a blocchi strutturati arrivato dal CMS. */
export function Prosa({ blocchi, className }: { blocchi: Blocco[]; className?: string }) {
  return (
    <div className={className ? `${s.prosa} ${className}` : s.prosa}>
      {blocchi.map((b, i) => {
        switch (b.tipo) {
          case "paragrafo":
            return <p key={i}>{b.testo}</p>;
          case "titolo":
            return <h2 key={i}>{b.testo}</h2>;
          case "sottotitolo":
            return <h3 key={i}>{b.testo}</h3>;
          case "citazione":
            return (
              <Ruvido key={i} as="blockquote" forma="striscia" tono="lilla" className={s.citazione}>
                <p>{b.testo}</p>
                {b.fonte && <footer className={s.fonte}>— {b.fonte}</footer>}
              </Ruvido>
            );
          case "elenco": {
            const L = b.ordinato ? "ol" : "ul";
            return (
              <L key={i}>
                {b.voci.map((v, j) => (
                  <li key={j}>{v}</li>
                ))}
              </L>
            );
          }
          case "immagine":
            return (
              <figure key={i} className={s.figura}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.immagine.src}
                  alt={b.immagine.alt}
                  width={b.immagine.larghezza}
                  height={b.immagine.altezza}
                  loading="lazy"
                />
                {b.didascalia && <figcaption>{b.didascalia}</figcaption>}
              </figure>
            );
        }
      })}
    </div>
  );
}

/** Stessa tipografia della prosa, ma con contenuto JSX (pagine legali, testi con link). */
export function ProsaTesto({ children }: { children: ReactNode }) {
  return <div className={s.prosa}>{children}</div>;
}
