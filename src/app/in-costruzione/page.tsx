import type { Metadata } from "next";
import { site } from "@/lib/site";
import s from "./pagina.module.css";

export const metadata: Metadata = {
  title: "Sito in costruzione",
  robots: { index: false, follow: false },
};

export default function InCostruzione() {
  return (
    <section className={`${s.pagina} superficie-verde carta`}>
      <div className={s.contenuto}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={s.logo}
          src="/logo/cultivar-payoff-bone.png"
          alt="Cultivar. Storie di olio d’oliva IGP di Sicilia"
          width={520}
          height={177}
          fetchPriority="high"
        />
        <h1 className={s.titolo}>Il sito è in costruzione</h1>
        <p className={s.testo}>Stiamo preparando il racconto dell’olio IGP di Sicilia. Torna a trovarci presto.</p>
        <p className={s.contatto}>
          Per informazioni: <a href={`mailto:${site.titolare.email}`}>{site.titolare.email}</a>
        </p>
      </div>
    </section>
  );
}
