import type { Metadata } from "next";
import Link from "next/link";
import { HeroInterno } from "@/components/HeroInterno";
import { RiapriConsenso } from "@/components/Consenso";
import { ProsaTesto } from "@/components/Prosa";
import { NotaBozza } from "@/components/NotaBozza";
import { Sezione } from "@/components/Sezione";
import { metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  titolo: "Cookie policy",
  descrizione: "Quali cookie usa il sito Cultivar e come gestire le tue preferenze sui video YouTube.",
  percorso: "/cookie",
});

/** TESTO SEGNAPOSTO da far validare dal legale prima della pubblicazione. */
export default function Cookie() {
  return (
    <>
      <HeroInterno occhiello="Note legali" titolo="Cookie policy" tono="kraft" stretto />
      <Sezione stretto>
        <NotaBozza />
        <ProsaTesto>
          <h2>Cookie tecnici</h2>
          <p>
            Il sito non usa cookie di profilazione né strumenti di analisi. Per ricordare la tua scelta sui video salva
            nel browser (localStorage) una sola voce, <code>cultivar-consenso-v1</code>, con l’esito e la data della scelta.
          </p>
          <h2>Video di YouTube</h2>
          <p>
            I documentari sono ospitati su YouTube (Google) e incorporati con la modalità a privacy avanzata
            (youtube-nocookie.com). Finché non premi il pulsante di riproduzione non viene caricato nulla da YouTube.
            Quando carichi un video, YouTube può impostare cookie propri e trattare dati secondo la sua informativa
            [link da inserire].
          </p>
          <h2>Gestire le tue preferenze</h2>
          <p>
            Puoi accettare i video una volta sola, accettarli per sempre o rifiutarli. Per cambiare idea:{" "}
            <RiapriConsenso />. Puoi anche cancellare i dati del sito dalle impostazioni del browser.
          </p>
          <p>
            Come trattiamo i dati personali: <Link href="/privacy">privacy policy</Link>.
          </p>
        </ProsaTesto>
      </Sezione>
    </>
  );
}
