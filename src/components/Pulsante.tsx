import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import s from "./Pulsante.module.css";

export type Variante = "primario" | "chiaro" | "secondario" | "lilla";

type Comuni = {
  variante?: Variante;
  dimensione?: "normale" | "piccolo";
  /** Mostra la freccia a destra */
  freccia?: boolean;
  children: ReactNode;
  className?: string;
};

type ComeLink = Comuni & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">;
type ComeBottone = Comuni & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

/**
 * Pulsante del marchio. Con `href` diventa un link (interno con next/link,
 * esterno con target _blank e rel sicuro), altrimenti un <button>.
 */
export function Pulsante(props: ComeLink | ComeBottone) {
  const { variante = "primario", dimensione = "normale", freccia, children, className } = props;
  const classi = [s.pulsante, s[variante], dimensione === "piccolo" ? s.piccolo : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  const contenuto = (
    <>
      <span>{children}</span>
      
    </>
  );

  if (props.href !== undefined) {
    const { href, variante: _v, dimensione: _d, freccia: _f, children: _c, className: _cl, ...resto } = props;
    const esterno = /^https?:\/\//.test(href);
    if (esterno) {
      return (
        <a href={href} className={classi} target="_blank" rel="noopener noreferrer" {...resto}>
          {contenuto}
          <span className="sr-only"> (si apre in una nuova scheda)</span>
        </a>
      );
    }
    return (
      <Link href={href} className={classi} {...resto}>
        {contenuto}
      </Link>
    );
  }

  const { variante: _v, dimensione: _d, freccia: _f, children: _c, className: _cl, href: _h, type = "button", ...resto } = props;
  return (
    <button type={type} className={classi} {...resto}>
      {contenuto}
    </button>
  );
}
