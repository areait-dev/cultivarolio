import Link from "next/link";
import type { ReactNode } from "react";
import { IconaFrecciaIndietro } from "./Icone";
import s from "./Sezione.module.css";

type Tono = "bone" | "kraft" | "lilla" | "verde" | "carbone";

/** Fascia di pagina: superficie + carta + contenitore centrato. */
export function Sezione({
  tono = "bone",
  stretta,
  senzaSopra,
  stretto,
  labelledby,
  className,
  children,
}: {
  tono?: Tono;
  stretta?: boolean;
  senzaSopra?: boolean;
  stretto?: boolean;
  labelledby?: string;
  className?: string;
  children: ReactNode;
}) {
  const classi = [
    "sezione",
    stretta && "sezione--stretta",
    senzaSopra && "sezione--senza-sopra",
    `superficie-${tono}`,
    "carta",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <section className={classi} aria-labelledby={labelledby}>
      <div className={`contenitore ${stretto ? "contenitore--stretto" : ""}`}>{children}</div>
    </section>
  );
}

/** Testata di sezione: titoli a sinistra, azione a destra (va a capo su mobile). */
export function TestaSezione({ children, azione }: { children: ReactNode; azione?: ReactNode }) {
  return (
    <div className={s.testa}>
      <div className={s.titoli}>{children}</div>
      {azione}
    </div>
  );
}

/** Link testuale con freccia. */
export function LinkTesto({ href, children, indietro }: { href: string; children: ReactNode; indietro?: boolean }) {
  return (
    <Link href={href} className={s.link}>
      {indietro && <IconaFrecciaIndietro className={s.freccia} />}
      <span>{children}</span>
      
    </Link>
  );
}
