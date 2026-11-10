import type { Metadata } from "next";
import { Illustrazione, Obiettivo, Pennellata, Territorio } from "@/components/Blocchi";
import { HeroInterno } from "@/components/HeroInterno";
import { InvitoCanale } from "@/components/InvitoCanale";
import { Ruvido } from "@/components/Ruvido";
import { Sezione } from "@/components/Sezione";
import { Intro, TitoloDisplay, TitoloSezione } from "@/components/Testo";
import { getDocumentari } from "@/lib/content";
import { metaPagina } from "@/lib/seo";
import { testi } from "@/lib/testi";
import s from "./pagina.module.css";

// ISR: i territori e i partner arrivano dai documentari del CMS
export const revalidate = 3600;

export const metadata: Metadata = metaPagina({
  titolo: "Il progetto",
  descrizione:
    "Cultivar nasce da un’idea semplice. Un prodotto si capisce davvero quando se ne conosce la storia.",
  percorso: "/il-progetto",
});

export default async function IlProgetto() {
  const documentari = await getDocumentari();
  const t = testi.progetto;

  return (
    <>
      <HeroInterno
        occhiello="Il progetto"
        titolo={t.titolo}
        decorazione={{ src: "/illustrazioni/ramo-lungo-bone.svg", larghezza: 260 }}
      />

      <Sezione>
        <div className="griglia-2">
          <Intro grande>{t.introduzione}</Intro>
          <div className={s.centro}>
            <Pennellata>
              <Illustrazione src="/illustrazioni/rametto-colore.svg" larghezza={200} />
            </Pennellata>
          </div>
        </div>
      </Sezione>

      <Sezione tono="verde" labelledby="obiettivi">
        <div className={`griglia-2 ${s.inAlto}`}>
          <div>
            <TitoloSezione id="obiettivi" className={s.titoloBlocco}>
              {t.obiettivi.titolo}
            </TitoloSezione>
            <div className={s.obiettivi}>
              {t.obiettivi.voci.map((v) => (
                <Obiettivo key={v.verbo} verbo={v.verbo} oggetto={v.oggetto}>
                  {v.testo}
                </Obiettivo>
              ))}
            </div>
          </div>
          <div className={`${s.centro} solo-desktop`}>
            <Illustrazione src="/illustrazioni/ramo-olive-bone.svg" larghezza={300} />
          </div>
        </div>
      </Sezione>

      <Sezione labelledby="storie">
        <TitoloSezione id="storie" className={s.titoloBlocco}>
          {t.storie.titolo}
        </TitoloSezione>
        <div className="griglia-4">
          {t.storie.voci.map((v) => (
            <div key={v.titolo} className={s.storia}>
              <Illustrazione src={v.illustrazione} larghezza={64} />
              <TitoloDisplay as="h3" dimensione="s">
                {v.titolo}
              </TitoloDisplay>
              <p>{v.testo}</p>
            </div>
          ))}
        </div>
      </Sezione>

      <Sezione tono="kraft" labelledby="territori">
        <TitoloSezione id="territori">{t.territori.titolo}</TitoloSezione>
        <Intro className={s.introTerritori}>{t.territori.testo}</Intro>
        <div className="griglia-3">
          {documentari.map((d) => (
            <Territorio key={d.slug} luogo={d.luogo} nome={d.partner} />
          ))}
        </div>
        <p className={s.ospitalita}>{t.territori.ospitalita}</p>
      </Sezione>

      <Sezione labelledby="chi">
        <div className={`griglia-2 ${s.allunga}`}>
          <div className={s.colonna}>
            <TitoloSezione id="chi">{t.chi.titolo}</TitoloSezione>
            <Intro>{t.chi.realizzazione}</Intro>
          </div>
          <Ruvido forma="pannello" tono="verde" riquadro>
            <p className={s.consorzio}>{t.chi.consorzio}</p>
          </Ruvido>
        </div>
      </Sezione>

      <InvitoCanale />
    </>
  );
}
