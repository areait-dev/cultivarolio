import { Illustrazione } from "./Blocchi";
import { Pulsante } from "./Pulsante";
import { Ruvido } from "./Ruvido";
import { Sezione } from "./Sezione";
import { Social } from "./Social";
import { TitoloDisplay } from "./Testo";
import { site } from "@/lib/site";
import { testi } from "@/lib/testi";
import s from "./InvitoCanale.module.css";

/** «Segui il racconto sul nostro canale YouTube e sui social»: chiude le pagine principali. */
export function InvitoCanale() {
  const t = testi.home.invito;
  return (
    <Sezione senzaSopra>
      <Ruvido forma="pannello" tono="verde" className={s.invito}>
        <div className={s.testo}>
          <TitoloDisplay as="p" dimensione="m">
            {t.testo}
          </TitoloDisplay>
          <div className="azioni">
            <Pulsante href={site.social.youtube} variante="chiaro">
              {t.pulsante}
            </Pulsante>
            <Social />
          </div>
        </div>
        <div className={`${s.immagine} solo-desktop`}>
          <Illustrazione src="/illustrazioni/canali.svg" larghezza={190} />
        </div>
      </Ruvido>
    </Sezione>
  );
}
