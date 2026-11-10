import type { ReactNode } from "react";
import s from "./Blocchi.module.css";

/** Cifra + etichetta sulla stessa riga e della stessa misura (es. "3 territori"). */
export function Numero({ cifra, titolo, testo }: { cifra: string | number; titolo: string; testo?: string }) {
  return (
    <div className={s.numero}>
      <p className={s.numeroTitolo}>
        <span className={s.cifra} aria-hidden="true">
          {cifra}
        </span>
        <span className="sr-only">{cifra} </span>
        {titolo}
      </p>
      {testo && <p className={s.numeroTesto}>{testo}</p>}
    </div>
  );
}

/** Obiettivo: verbo grande + oggetto + descrizione. */
export function Obiettivo({ verbo, oggetto, children }: { verbo: string; oggetto: string; children: ReactNode }) {
  return (
    <div>
      <h3 className={s.verbo}>
        {verbo} <span className={s.oggetto}>{oggetto}</span>
      </h3>
      <p className={s.obiettivoTesto}>{children}</p>
    </div>
  );
}

/** Territorio: luogo + nome del partner, con filetto sopra. */
export function Territorio({ luogo, nome }: { luogo: string; nome: string }) {
  return (
    <div className={s.territorio}>
      <p className={s.luogo}>{luogo}</p>
      <p className={s.territorioNome}>{nome}</p>
    </div>
  );
}

/** Divisore con il tratto di pennello. */
export function Tratto({ className }: { className?: string }) {
  return <hr className={[s.tratto, className].filter(Boolean).join(" ")} />;
}

/** Pennellata lilla dietro un'illustrazione. */
export function Pennellata({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={[s.pennellata, className].filter(Boolean).join(" ")}>{children}</span>;
}

/** Illustrazione decorativa del marchio (sempre alt vuoto: non porta contenuto). */
export function Illustrazione({
  src,
  larghezza,
  className,
  priorita,
}: {
  src: string;
  larghezza: number;
  className?: string;
  priorita?: boolean;
}) {
  const dim = DIMENSIONI[src] ?? [larghezza, larghezza];
  // larghezza scelta dalla pagina, altezza dalle proporzioni intrinseche (niente stili inline, niente CLS)
  const altezza = Math.round((larghezza * dim[1]) / dim[0]);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG statici, già leggeri
    <img
      src={src}
      alt=""
      width={larghezza}
      height={altezza}
      className={className}
      loading={priorita ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priorita ? "high" : undefined}
    />
  );
}

/** Proporzioni intrinseche degli SVG, per evitare spostamenti di layout (CLS). */
const DIMENSIONI: Record<string, [number, number]> = {
  "/illustrazioni/alloro-bone.svg": [354, 318],
  "/illustrazioni/alloro-carbone.svg": [354, 318],
  "/illustrazioni/coppia-olive-bone.svg": [293, 289],
  "/illustrazioni/coppia-olive-carbone.svg": [293, 289],
  "/illustrazioni/foglie-carbone.svg": [327, 137],
  "/illustrazioni/foglie-verde.svg": [327, 137],
  "/illustrazioni/grappolo-carbone.svg": [545, 682],
  "/illustrazioni/oliva-bone.svg": [193, 255],
  "/illustrazioni/oliva-colore.svg": [193, 255],
  "/illustrazioni/rametto-bone.svg": [262, 534],
  "/illustrazioni/rametto-colore.svg": [262, 534],
  "/illustrazioni/ramo-colore.svg": [342, 459],
  "/illustrazioni/ramo-lungo-bone.svg": [268, 254],
  "/illustrazioni/ramo-lungo-carbone.svg": [268, 254],
  "/illustrazioni/ramo-lungo-colore.svg": [268, 254],
  "/illustrazioni/ramo-olive-bone.svg": [496, 614],
  "/illustrazioni/ramo-olive-carbone.svg": [496, 614],
  "/illustrazioni/tralcio-carbone.svg": [789, 142],
};

export const ILLUSTRAZIONI = Object.keys(DIMENSIONI);
