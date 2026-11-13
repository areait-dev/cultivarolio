"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Pulsante } from "./Pulsante";
import s from "./Consenso.module.css";

/**
 * Consenso per i contenuti di terze parti (video YouTube) e per le statistiche (Google Tag Manager / Analytics).
 * Se aggiungi una categoria, estendi `Preferenze` e aggiorna la cookie policy.
 */
type Stato = "accettato" | "rifiutato";
type Preferenze = { mediaEsterni: Stato; statistiche: Stato; data: string };

const CHIAVE = "cultivar-consenso-v1";

type Ctx = {
  preferenze: Preferenze | null;
  pronto: boolean;
  salva: (s: Stato) => void;
  riapri: () => void;
};
const ConsensoContext = createContext<Ctx | null>(null);

export function useConsenso() {
  const c = useContext(ConsensoContext);
  if (!c) throw new Error("useConsenso va usato dentro <ConsensoProvider>");
  return c;
}

function leggi(): Preferenze | null {
  try {
    const v = localStorage.getItem(CHIAVE);
    const p = v ? (JSON.parse(v) as Partial<Preferenze>) : null;
    // scelte salvate prima delle statistiche: si chiede di nuovo
    return p && p.mediaEsterni && p.statistiche ? (p as Preferenze) : null;
  } catch {
    return null;
  }
}

export function ConsensoProvider({ children, senzaBanner = false }: { children: ReactNode; senzaBanner?: boolean }) {
  const [preferenze, setPreferenze] = useState<Preferenze | null>(null);
  const [pronto, setPronto] = useState(false);
  const [aperto, setAperto] = useState(false);

  useEffect(() => {
    const p = leggi();
    setPreferenze(p);
    setAperto(!p);
    setPronto(true);
  }, []);

  const salva = useCallback((stato: Stato) => {
    const eraAccettato = leggi()?.statistiche === "accettato";
    const p = { mediaEsterni: stato, statistiche: stato, data: new Date().toISOString() };
    try {
      localStorage.setItem(CHIAVE, JSON.stringify(p));
    } catch {
      /* storage non disponibile: la scelta vale per la sessione */
    }
    setPreferenze(p);
    setAperto(false);
    if (stato === "rifiutato" && eraAccettato) {
      // revoca: cancella i cookie di Google Analytics e ricarica per fermare gli script già caricati
      for (const nome of document.cookie.split(";").map((c) => c.split("=")[0].trim())) {
        if (nome.startsWith("_ga") || nome === "_gid") {
          document.cookie = `${nome}=; Max-Age=0; path=/`;
          document.cookie = `${nome}=; Max-Age=0; path=/; domain=.${location.hostname.replace(/^www\./, "")}`;
        }
      }
      location.reload();
    }
  }, []);

  const riapri = useCallback(() => setAperto(true), []);

  // valore stabile: chi usa il consenso (video, footer) si aggiorna solo se cambia davvero
  const valore = useMemo(() => ({ preferenze, pronto, salva, riapri }), [preferenze, pronto, salva, riapri]);

  return (
    <ConsensoContext.Provider value={valore}>
      {children}
      {!senzaBanner && pronto && aperto && <Banner onScelta={salva} />}
    </ConsensoContext.Provider>
  );
}

function Banner({ onScelta }: { onScelta: (s: Stato) => void }) {
  return (
    <section className={`${s.banner} superficie-carbone`} role="region" aria-labelledby="consenso-titolo">
      <div className={s.testo}>
        <h2 id="consenso-titolo" className={s.titolo}>
          Cookie, statistiche e video
        </h2>
        <p>
          Usiamo cookie tecnici e, solo se accetti, strumenti di statistica (Google Analytics) per capire come viene
          usato il sito. I documentari sono ospitati su YouTube, che può impostare cookie propri quando carichi un
          video.{" "}
          <Link href="/cookie" className={s.link}>
            Cookie policy
          </Link>
        </p>
      </div>
      <div className={s.azioni}>
        <Pulsante variante="secondario" dimensione="piccolo" onClick={() => onScelta("rifiutato")}>
          Solo tecnici
        </Pulsante>
        <Pulsante variante="chiaro" dimensione="piccolo" onClick={() => onScelta("accettato")}>
          Accetta tutto
        </Pulsante>
      </div>
    </section>
  );
}

/** Link "Preferenze cookie" per il footer. */
export function RiapriConsenso({ className }: { className?: string }) {
  const { riapri } = useConsenso();
  return (
    <button type="button" className={`${s.riapri} ${className ?? ""}`} onClick={riapri}>
      Preferenze cookie
    </button>
  );
}
