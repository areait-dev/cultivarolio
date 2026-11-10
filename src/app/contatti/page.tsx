import type { Metadata } from "next";
import { Illustrazione } from "@/components/Blocchi";
import { HeroInterno } from "@/components/HeroInterno";
import { ModuloContatti } from "@/components/ModuloContatti";
import { Ruvido } from "@/components/Ruvido";
import { Sezione } from "@/components/Sezione";
import { TitoloDisplay } from "@/components/Testo";
import { metaPagina } from "@/lib/seo";
import { site } from "@/lib/site";
import { testi } from "@/lib/testi";
import s from "./pagina.module.css";

export const metadata: Metadata = metaPagina({
  titolo: "Contatti",
  descrizione: testi.contatti.intro,
  percorso: "/contatti",
});

export default function Contatti() {
  const t = site.titolare;
  return (
    <>
      <HeroInterno
        titolo={testi.contatti.titolo}
        intro={testi.contatti.intro}
        decorazione={{ src: "/illustrazioni/oliva-bone.svg", larghezza: 140 }}
      />
      <Sezione>
        <div className={s.griglia}>
          <ModuloContatti />
          <Ruvido as="aside" forma="pannello" tono="kraft" riquadro aria-label="Recapiti">
            <div className={s.recapiti}>
              <TitoloDisplay as="p" dimensione="s" minuscolo>
                {t.ragioneSociale}
              </TitoloDisplay>
              <p>
                <strong>Unit</strong>
                {t.unit}
              </p>
              <p>
                <strong>Sede</strong>
                {t.sede}
              </p>
              <p>
                <strong>Telefono</strong>
                <a href={`tel:+39${t.telefono.replace(/\s/g, "")}`}>{t.telefono}</a>
              </p>
              <p>
                <strong>Email</strong>
                <a href={`mailto:${t.email}`}>{t.email}</a>
              </p>
              <Illustrazione src="/illustrazioni/coppia-olive-carbone.svg" larghezza={120} />
            </div>
          </Ruvido>
        </div>
      </Sezione>
    </>
  );
}
