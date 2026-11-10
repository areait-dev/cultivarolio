import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import s from "./Ruvido.module.css";

export type Forma = "scheda" | "striscia" | "pannello" | "cornice";
export type Tono = "verde" | "carbone" | "bone" | "kraft" | "lilla";

type Props<T extends ElementType> = {
  as?: T;
  forma?: Forma;
  tono?: Tono;
  /** Aggiunge il padding standard del riquadro */
  riquadro?: boolean;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

/**
 * Riquadro con il bordo "ruvido" della presentazione, usato come maschera.
 * Il tono imposta anche la superficie semantica, così testo e focus
 * all'interno hanno sempre il contrasto giusto.
 */
export function Ruvido<T extends ElementType = "div">({
  as,
  forma = "pannello",
  tono = "kraft",
  riquadro = false,
  className,
  ...resto
}: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  const classi = [
    s.ruvido,
    s[forma],
    // la cornice è solo un contorno: eredita i colori della sezione
    forma === "cornice" ? "" : `superficie-${tono}`,
    riquadro ? s.riquadro : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return <Tag className={classi} data-forma={forma} {...resto} />;
}
