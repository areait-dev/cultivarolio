import type { ReactNode } from "react";
import type { Blocco } from "@/lib/content/types";
import { Ruvido } from "./Ruvido";
import s from "./Prosa.module.css";

type BloccoImmagine = Extract<Blocco, { tipo: "immagine" }>;

function Figura({ b }: { b: BloccoImmagine }) {
  return (
    <figure className={s.figura}>
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

/** Paragrafi ed elenchi: i soli blocchi che possono stare accanto a un'immagine allineata. */
function Testo({ b }: { b: Blocco }): ReactNode {
  if (b.tipo === "paragrafo") return <p>{b.testo}</p>;
  if (b.tipo === "elenco") {
    const L = b.ordinato ? "ol" : "ul";
    return (
      <L>
        {b.voci.map((v, j) => (
          <li key={j}>{v}</li>
        ))}
      </L>
    );
  }
  return null;
}

const èTesto = (b?: Blocco) => b?.tipo === "paragrafo" || b?.tipo === "elenco";

/** Rende il corpo dell'articolo a blocchi strutturati arrivato dal CMS. */
export function Prosa({ blocchi, className }: { blocchi: Blocco[]; className?: string }) {
  const elementi: ReactNode[] = [];

  for (let i = 0; i < blocchi.length; i++) {
    const b = blocchi[i];

    // Immagine allineata + i paragrafi che la seguono (fino al prossimo titolo): due colonne.
    // L'ultimo paragrafo è la chiusura e va sotto, a tutta larghezza; con un solo paragrafo resta di fianco.
    if (b.tipo === "immagine" && b.allineamento && èTesto(blocchi[i + 1])) {
      const testi: Blocco[] = [];
      let j = i + 1;
      while (èTesto(blocchi[j])) testi.push(blocchi[j++]);
      const chiusura = testi.length > 1 && testi[testi.length - 1].tipo === "paragrafo" ? testi.pop() : undefined;
      elementi.push(
        <div key={i} className={b.allineamento === "destra" ? `${s.coppia} ${s.coppiaDestra}` : s.coppia}>
          <Figura b={b} />
          <div className={s.lato}>
            {testi.map((t, k) => (
              <Testo key={k} b={t} />
            ))}
          </div>
          {chiusura && (
            <div className={s.chiusura}>
              <Testo b={chiusura} />
            </div>
          )}
        </div>,
      );
      i = j - 1;
      continue;
    }

    switch (b.tipo) {
      case "paragrafo":
      case "elenco":
        elementi.push(<Testo key={i} b={b} />);
        break;
      case "titolo":
        elementi.push(<h2 key={i}>{b.testo}</h2>);
        break;
      case "sottotitolo":
        elementi.push(<h3 key={i}>{b.testo}</h3>);
        break;
      case "citazione":
        elementi.push(
          <Ruvido key={i} as="blockquote" forma="striscia" tono="lilla" className={s.citazione}>
            <p>{b.testo}</p>
            {b.fonte && <footer className={s.fonte}>— {b.fonte}</footer>}
          </Ruvido>,
        );
        break;
      case "immagine":
        elementi.push(<Figura key={i} b={b} />);
        break;
      case "gruppo":
        elementi.push(
          <div key={i} className={s.gruppo}>
            <figure className={s.gruppoFigura} style={{ width: b.immagine.larghezza }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.immagine.src}
                alt={b.immagine.alt}
                width={b.immagine.larghezza}
                height={b.immagine.altezza}
                loading="lazy"
              />
            </figure>
            <div className={s.gruppoTesto}>
              {b.testi.map((t, k) => (
                <Testo key={k} b={t} />
              ))}
            </div>
          </div>,
        );
        break;
    }
  }

  return <div className={className ? `${s.prosa} ${className}` : s.prosa}>{elementi}</div>;
}

/** Stessa tipografia della prosa, ma con contenuto JSX (pagine legali, testi con link). */
export function ProsaTesto({ children }: { children: ReactNode }) {
  return <div className={s.prosa}>{children}</div>;
}
