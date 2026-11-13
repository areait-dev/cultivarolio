import type { Metadata } from "next";
import Link from "next/link";
import { HeroInterno } from "@/components/HeroInterno";
import { ProsaTesto } from "@/components/Prosa";
import { NotaBozza } from "@/components/NotaBozza";
import { Sezione } from "@/components/Sezione";
import { metaPagina } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = metaPagina({
  titolo: "Privacy policy",
  descrizione: "Informativa sul trattamento dei dati personali raccolti tramite il sito Cultivar.",
  percorso: "/privacy",
});

/**
 * TESTO SEGNAPOSTO: struttura tipica di un'informativa ex artt. 13-14 Reg. UE 2016/679,
 * da far validare e completare dal legale prima della pubblicazione.
 */
export default function Privacy() {
  const t = site.titolare;
  return (
    <>
      <HeroInterno occhiello="Note legali" titolo="Privacy policy" tono="kraft" stretto />
      <Sezione stretto>
        <NotaBozza />
        <ProsaTesto>
          <h2>Titolare del trattamento</h2>
          <p>
            {t.ragioneSociale}, {t.sede}, P.IVA {t.piva}. Contatto per la privacy:{" "}
            <a href={`mailto:${t.email}`}>{t.email}</a>.
          </p>
          <h2>Quali dati trattiamo</h2>
          <p>
            Attraverso il modulo contatti raccogliamo nome e cognome, indirizzo email, il profilo che scegli (consumatore,
            buyer, operatore Ho.Re.Ca., produttore, stampa, altro) e il testo del messaggio. Il sito non usa cookie di
            profilazione; gli strumenti di statistica si attivano solo con il tuo consenso (vedi cookie policy).
          </p>
          <h2>Perché e su quale base</h2>
          <p>
            Usiamo questi dati solo per rispondere alla tua richiesta. La base giuridica è il tuo consenso (art. 6,
            par. 1, lett. a, Reg. UE 2016/679), che puoi revocare in qualsiasi momento.
          </p>
          <h2>Per quanto tempo</h2>
          <p>[Da definire: tempo di conservazione dei messaggi, ad esempio 12 mesi dall’ultima comunicazione.]</p>
          <h2>A chi li comunichiamo</h2>
          <p>
            I dati sono visti dal personale autorizzato di {t.ragioneSociale} e dal fornitore del servizio email usato per
            recapitare i messaggi [da indicare]. Non sono diffusi né venduti.
          </p>
          <h2>I tuoi diritti</h2>
          <p>
            Puoi chiedere accesso, rettifica, cancellazione, limitazione, opposizione e portabilità dei dati scrivendo a{" "}
            <a href={`mailto:${t.email}`}>{t.email}</a>. Hai inoltre diritto di proporre reclamo al Garante per la
            protezione dei dati personali.
          </p>
          <h2>Video e cookie</h2>
          <p>
            I documentari sono ospitati su YouTube. Che cosa succede quando li guardi è spiegato nella{" "}
            <Link href="/cookie">cookie policy</Link>.
          </p>
        </ProsaTesto>
      </Sezione>
    </>
  );
}
