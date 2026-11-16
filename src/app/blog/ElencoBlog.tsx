import { PITTOGRAMMA } from "@/components/Blocchi";
import { HeroInterno } from "@/components/HeroInterno";
import { FiltriCategoria } from "@/components/FiltriCategoria";
import { InvitoCanale } from "@/components/InvitoCanale";
import { SchedaArticolo } from "@/components/Schede";
import { Sezione } from "@/components/Sezione";
import { TitoloSezione } from "@/components/Testo";
import { getArticoli, getCategorie } from "@/lib/content";
import { getTesti } from "@/lib/dati-sito";
import s from "./blog.module.css";

const toni = ["kraft", "lilla", "kraft"] as const;

/** Pagina del blog, con o senza filtro per categoria (condivisa da /blog e /blog/categoria/[slug]). */
export async function ElencoBlog({ categoria }: { categoria?: string }) {
  const [articoli, categorie, testi] = await Promise.all([getArticoli(categoria), getCategorie(), getTesti()]);
  const t = testi.blog;

  return (
    <>
      <HeroInterno
        occhiello="Blog"
        titolo={t.titolo}
        intro={t.intro}
        decorazione={{ src: PITTOGRAMMA, larghezza: 340 }}
      />
      <Sezione className={s.elenco} labelledby="ultimi">
        <TitoloSezione id="ultimi" className={s.titolo}>
          {t.elenco}
        </TitoloSezione>
        <div className={s.filtri}>
          <FiltriCategoria categorie={categorie} attiva={categoria} />
        </div>
        {articoli.length ? (
          <div className="griglia-3">
            {articoli.map((a, i) => (
              <SchedaArticolo key={a.slug} articolo={a} tono={toni[i % 3]} conImmagine livello={2} />
            ))}
          </div>
        ) : (
          <p>Nessun articolo in questa categoria.</p>
        )}
      </Sezione>

      <InvitoCanale />
    </>
  );
}
