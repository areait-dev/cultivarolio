import type { Metadata } from "next";
import s from "./pagina.module.css";

export const metadata: Metadata = {
  title: "Sito in costruzione",
  robots: { index: false, follow: false },
};

// Il testo è dentro le immagini (public/in-costruzione-*.png): per cambiarlo si sostituiscono i due file.
export default function InCostruzione() {
  return (
    <div className={s.pagina}>
      <h1 className="sr-only">Cultivar – il sito è in costruzione</h1>
      <picture>
        <source media="(orientation: portrait)" srcSet="/in-costruzione-mobile.png" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={s.immagine}
          src="/in-costruzione-desktop.png"
          alt="Cultivar, storie di olio d’oliva IGP di Sicilia. Il sito è in costruzione. Progetto cofinanziato dalla Regione Siciliana – Assessorato per le Attività Produttive – Iniziativa “Sicilia che piace 2026” – Capitolo di Bilancio 342525"
          fetchPriority="high"
        />
      </picture>
    </div>
  );
}
