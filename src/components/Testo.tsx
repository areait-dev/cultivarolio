import type { ElementType, ReactNode } from "react";
import s from "./Testo.module.css";

type Base = { children: ReactNode; className?: string; id?: string };
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

/** Occhiello: etichetta maiuscola sopra un titolo. */
export function Occhiello({ children, className, as: Tag = "p" }: Base & { as?: ElementType }) {
  return <Tag className={cx(s.occhiello, className)}>{children}</Tag>;
}

/** Titolo di sezione nel carattere del marchio; con `maiuscolo` è in Poppins maiuscolo (come nella presentazione). */
export function TitoloSezione({
  children,
  className,
  id,
  as: Tag = "h2",
  maiuscolo,
}: Base & { as?: ElementType; maiuscolo?: boolean }) {
  return (
    <Tag id={id} className={cx(s.titoloSezione, maiuscolo && s.maiuscolo, className)}>
      {children}
    </Tag>
  );
}

export type DimensioneDisplay = "s" | "m" | "l" | "xl";

/**
 * Titolo display (carattere del marchio, in minuscolo per regola di marca).
 * Scrivi il testo con le maiuscole corrette: il minuscolo è solo visivo,
 * così titoli SEO, lettori di schermo e condivisioni restano corretti.
 * Usa `minuscolo={false}` per nomi propri e ragioni sociali se il cliente lo chiede.
 */
export function TitoloDisplay({
  children,
  className,
  id,
  as: Tag = "h2",
  dimensione = "l",
  minuscolo = true,
}: Base & { as?: ElementType; dimensione?: DimensioneDisplay; minuscolo?: boolean }) {
  return (
    <Tag id={id} className={cx(s.display, s[`display_${dimensione}`], !minuscolo && s.naturale, className)}>
      {children}
    </Tag>
  );
}

/** Paragrafo introduttivo, più grande del testo corrente. */
export function Intro({ children, className, grande }: Base & { grande?: boolean }) {
  return <p className={cx(s.intro, grande && s.introGrande, className)}>{children}</p>;
}

/** Testo secondario (date, note). */
export function Tenue({ children, className, as: Tag = "p" }: Base & { as?: ElementType }) {
  return <Tag className={cx(s.tenue, className)}>{children}</Tag>;
}

/** Meta: maiuscoletto piccolo per categorie, episodi, date. */
export function Meta({ children, className, as: Tag = "p" }: Base & { as?: ElementType }) {
  return <Tag className={cx(s.meta, className)}>{children}</Tag>;
}
