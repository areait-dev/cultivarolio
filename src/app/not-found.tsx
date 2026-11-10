import type { Metadata } from "next";
import { Illustrazione } from "@/components/Blocchi";
import { HeroInterno } from "@/components/HeroInterno";
import { Pulsante } from "@/components/Pulsante";

export const metadata: Metadata = { title: "Pagina non trovata", robots: { index: false } };

export default function NonTrovata() {
  return (
    <HeroInterno
      occhiello="Errore 404"
      titolo="Pagina non trovata"
      intro="La pagina che cerchi non esiste più o l’indirizzo non è corretto."
      decorazione={{ src: "/illustrazioni/rametto-bone.svg", larghezza: 160 }}
    >
      <div className="azioni">
        <Pulsante href="/" variante="chiaro">
          Torna alla home
        </Pulsante>
        <Pulsante href="/blog" variante="secondario">
          Vai al blog
        </Pulsante>
      </div>
    </HeroInterno>
  );
}
