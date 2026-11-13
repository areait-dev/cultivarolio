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
            Il sito non usa cookie di profilazione. Per ricordare la tua scelta salva nel browser (localStorage) una sola
            voce, <code>cultivar-consenso-v1</code>, con l’esito e la data.
          </p>
          <h2>Statistiche (Google Analytics)</h2>
          <p>
            Solo se accetti, il sito carica Google Tag Manager e Google Analytics, che impostano cookie (come{" "}
            <code>_ga</code>) per misurare in forma statistica le visite: pagine viste, provenienza, dispositivo. Se
            rifiuti, non viene caricato nulla di Google. Informativa di{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Google<span className="sr-only"> (si apre in una nuova scheda)</span>
            </a>
            .
          </p>
          <h2>Video di YouTube</h2>
          <p>
            I documentari sono ospitati su YouTube (Google) e incorporati con la modalità a privacy avanzata
            (youtube-nocookie.com). Finché non premi il pulsante di riproduzione non viene caricato nulla da YouTube.
            Quando carichi un video, YouTube può impostare cookie propri e trattare dati secondo la{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              sua informativa<span className="sr-only"> (si apre in una nuova scheda)</span>
            </a>
            .
          </p>
          <h2>Gestire le tue preferenze</h2>
          <p>
            Puoi accettare o rifiutare statistiche e video; i video si possono anche accettare uno alla volta. Per cambiare idea:{" "}
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
