import type { Metadata } from "next";
import { PITTOGRAMMA } from "@/components/Blocchi";
import { HeroInterno } from "@/components/HeroInterno";
import { InvitoCanale } from "@/components/InvitoCanale";
import { ModuloContatti } from "@/components/ModuloContatti";
import { Ruvido } from "@/components/Ruvido";
import { Sezione } from "@/components/Sezione";
import { TitoloDisplay } from "@/components/Testo";
import { metaPagina } from "@/lib/seo";
import { getSeoPagina, getSito, getTesti } from "@/lib/dati-sito";
import s from "./pagina.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const [testi, seo] = await Promise.all([getTesti(), getSeoPagina("contatti")]);
  return metaPagina({ titolo: "Contatti", descrizione: testi.contatti.intro, percorso: "/contatti", seo });
}

export default async function Contatti() {
  const [testi, site] = await Promise.all([getTesti(), getSito()]);
  const t = site.titolare;
  return (
    <>
      <HeroInterno
        titolo={testi.contatti.titolo}
        intro={testi.contatti.intro}
        decorazione={{ src: PITTOGRAMMA, larghezza: 340 }}
      />
      <Sezione>
        <div className={s.griglia}>
          <ModuloContatti profili={testi.contatti.profili} />
          <Ruvido as="aside" forma="pannello" tono="kraft" riquadro aria-label="Recapiti">
            <div className={s.recapiti}>
              <TitoloDisplay as="p" dimensione="s" minuscolo={false}>
                {t.ragioneSociale}
              </TitoloDisplay>
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
            </div>
          </Ruvido>
        </div>
      </Sezione>

      <InvitoCanale />
    </>
  );
}
