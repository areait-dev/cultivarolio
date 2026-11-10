"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Pulsante } from "./Pulsante";
import s from "./Consenso.module.css";

/**
 * Consenso per i contenuti di terze parti (video YouTube).
 * Il sito non usa cookie di profilazione né analytics: se ne aggiungi,
 * estendi `Preferenze` con una nuova categoria e aggiorna la cookie policy.
 */
type Stato = "accettato" | "rifiutato";
type Preferenze = { mediaEsterni: Stato; data: string };

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
    return v ? (JSON.parse(v) as Preferenze) : null;
  } catch {
    return null;
  }
}

export function ConsensoProvider({ children }: { children: ReactNode }) {
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
    const p = { mediaEsterni: stato, data: new Date().toISOString() };
    try {
      localStorage.setItem(CHIAVE, JSON.stringify(p));
    } catch {
      /* storage non disponibile: la scelta vale per la sessione */
    }
    setPreferenze(p);
    setAperto(false);
  }, []);

  const riapri = useCallback(() => setAperto(true), []);

  // valore stabile: chi usa il consenso (video, footer) si aggiorna solo se cambia davvero
  const valore = useMemo(() => ({ preferenze, pronto, salva, riapri }), [preferenze, pronto, salva, riapri]);

  return (
    <ConsensoContext.Provider value={valore}>
      {children}
      {pronto && aperto && <Banner onScelta={salva} />}
    </ConsensoContext.Provider>
  );
}

function Banner({ onScelta }: { onScelta: (s: Stato) => void }) {
  return (
    <section className={`${s.banner} superficie-carbone`} role="region" aria-labelledby="consenso-titolo">
      <div className={s.testo}>
        <h2 id="consenso-titolo" className={s.titolo}>
          Cookie e video
        </h2>
        <p>
          Usiamo solo cookie tecnici. I documentari sono ospitati su YouTube, che può impostare cookie propri quando
          carichi un video. Puoi accettarli ora o decidere video per video.{" "}
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
          Accetta video YouTube
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
