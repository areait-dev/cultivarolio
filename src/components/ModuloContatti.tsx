"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { StatoModulo } from "@/app/contatti/modello";
import { Pulsante } from "./Pulsante";
import { Ruvido } from "./Ruvido";
import s from "./ModuloContatti.module.css";

const iniziale: StatoModulo = { esito: "inattivo" };

const CHIAVE_TURNSTILE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Turnstile = {
  render(el: HTMLElement, opz: Record<string, unknown>): string;
  reset(id: string): void;
  remove(id: string): void;
};
const turnstile = () => (window as unknown as { turnstile?: Turnstile }).turnstile;

/** Cloudflare Turnstile si carica solo quando la persona inizia a compilare il modulo. */
let caricamento: Promise<void> | null = null;
function caricaTurnstile(): Promise<void> {
  if (!CHIAVE_TURNSTILE) return Promise.resolve();
  caricamento ??= new Promise<void>((ok, ko) => {
    const el = document.createElement("script");
    el.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    el.async = true;
    el.onload = () => ok();
    el.onerror = () => {
      caricamento = null;
      ko(new Error("Turnstile non caricato"));
    };
    document.head.appendChild(el);
  });
  return caricamento;
}

/**
 * Modulo contatti: invia in JSON a /api/contatti (validazione con zod + email via Resend).
 * La validazione vera è sul server; il browser mostra errori e conferma senza ricaricare.
 * `profili` arriva da WordPress (pagina "contatti") e il server li ricontrolla.
 */
export function ModuloContatti({ profili }: { profili: string[] }) {
  const [stato, setStato] = useState<StatoModulo>(iniziale);
  const [inCorso, setInCorso] = useState(false);
  const riepilogo = useRef<HTMLDivElement>(null);
  const contenitoreTs = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [erroreVerifica, setErroreVerifica] = useState("");
  const e = stato.errori ?? {};
  const v = stato.esito === "ok" ? {} : (stato.valori ?? {});

  // Mostra la casella "Non sono un robot" la prima volta che si inizia a compilare il modulo
  async function mostraVerifica() {
    if (!CHIAVE_TURNSTILE || widget.current !== null) return;
    widget.current = ""; // evita doppi render mentre lo script si carica
    try {
      await caricaTurnstile();
      const ts = turnstile();
      if (!ts || !contenitoreTs.current) throw new Error("Turnstile non disponibile");
      widget.current = ts.render(contenitoreTs.current, {
        sitekey: CHIAVE_TURNSTILE,
        appearance: "always",
        language: "it",
        callback: (tk: string) => {
          setToken(tk);
          setErroreVerifica("");
        },
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    } catch {
      widget.current = null;
      setErroreVerifica("Non riusciamo a caricare la verifica. Riprova tra poco o scrivici via email.");
    }
  }

  // Il pulsante resta attivo (così non perde il focus): durante l'invio si blocca un secondo invio qui
  async function invia(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (inCorso) return;
    if (CHIAVE_TURNSTILE && !token) {
      setErroreVerifica("Conferma di non essere un robot spuntando la casella.");
      void mostraVerifica();
      return;
    }
    const form = ev.currentTarget;
    const dati = new FormData(form);
    setInCorso(true);
    try {
      const r = await fetch("/api/contatti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: dati.get("nome"),
          email: dati.get("email"),
          profilo: dati.get("profilo"),
          messaggio: dati.get("messaggio"),
          consenso: dati.get("consenso") === "on",
          sito_web: dati.get("sito_web"),
          turnstile: token,
        }),
      });
      const esito = (await r.json()) as StatoModulo;
      setStato(esito);
      if (esito.esito === "ok") form.reset();
    } catch {
      setStato({
        esito: "errore",
        messaggio: "Non siamo riusciti a inviare il messaggio. Riprova tra poco o scrivici via email.",
        valori: {
          nome: String(dati.get("nome") ?? ""),
          email: String(dati.get("email") ?? ""),
          profilo: String(dati.get("profilo") ?? ""),
          messaggio: String(dati.get("messaggio") ?? ""),
        },
      });
    } finally {
      setInCorso(false);
      // il token vale una sola volta: dopo l'invio serve una nuova verifica
      setToken("");
      const ts = turnstile();
      if (ts && widget.current) ts.reset(widget.current);
    }
  }

  // porta il focus sull'esito, così chi usa lettori di schermo lo sente subito
  useEffect(() => {
    if (stato.esito !== "inattivo") riepilogo.current?.focus();
  }, [stato]);

  return (
    <form className={s.modulo} noValidate onSubmit={invia} onFocus={() => void mostraVerifica()}>
      <div ref={riepilogo} tabIndex={-1} aria-live="polite" className={s.esitoContenitore}>
        {stato.esito === "ok" && (
          <Ruvido forma="striscia" tono="lilla" riquadro role="status">
            {stato.messaggio}
          </Ruvido>
        )}
        {stato.esito === "errore" && stato.messaggio && <p className={s.erroreGenerale}>{stato.messaggio}</p>}
      </div>

      <div className={s.due}>
        <Campo id="nome" etichetta="Nome e cognome" errore={e.nome}>
          <input
            id="nome"
            name="nome"
            required
            autoComplete="name"
            defaultValue={v.nome}
            aria-invalid={!!e.nome || undefined}
            aria-describedby={e.nome ? "nome-errore" : undefined}
          />
        </Campo>
        <Campo id="email" etichetta="Email" errore={e.email}>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            defaultValue={v.email}
            aria-invalid={!!e.email || undefined}
            aria-describedby={e.email ? "email-errore" : undefined}
          />
        </Campo>
      </div>

      <fieldset className={s.fieldset}>
        <legend className={s.etichetta}>Chi sei</legend>
        <div className={s.scelte}>
          {profili.map((p) => (
            <label key={p} className={s.scelta}>
              <input type="radio" name="profilo" value={p} defaultChecked={(v.profilo ?? profili[0]) === p} />
              <span>{p}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Campo id="messaggio" etichetta="Messaggio" errore={e.messaggio}>
        <textarea
          id="messaggio"
          name="messaggio"
          required
          rows={6}
          maxLength={5000}
          defaultValue={v.messaggio}
          aria-invalid={!!e.messaggio || undefined}
          aria-describedby={e.messaggio ? "messaggio-errore" : undefined}
        />
      </Campo>

      {/* Honeypot: invisibile alle persone, compilato dai bot */}
      <div className={s.trappola} aria-hidden="true">
        <label htmlFor="sito_web">Lascia vuoto questo campo</label>
        <input id="sito_web" name="sito_web" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={s.campo}>
        <label className={s.consenso}>
          <input
            type="checkbox"
            name="consenso"
            required
            aria-invalid={!!e.consenso || undefined}
            aria-describedby={e.consenso ? "consenso-errore" : undefined}
          />
          <span>
            Consenso al trattamento dei dati personali ai sensi del Regolamento UE 2016/679.{" "}
            <Link href="/privacy">Privacy policy</Link> <span aria-hidden="true">*</span>
          </span>
        </label>
        {e.consenso && (
          <p id="consenso-errore" className={s.errore}>
            {e.consenso}
          </p>
        )}
      </div>

      <p className={s.nota}>
        I campi con <span aria-hidden="true">*</span>
        <span className="sr-only">asterisco</span> sono obbligatori.
      </p>

      {/* Verifica antirobot Cloudflare (casella "Non sono un robot") */}
      {CHIAVE_TURNSTILE && (
        <div className={s.campo}>
          <div ref={contenitoreTs} />
          {erroreVerifica && (
            <p role="alert" className={s.errore}>
              {erroreVerifica}
            </p>
          )}
        </div>
      )}

      <div>
        <Pulsante type="submit" aria-disabled={inCorso}>
          {inCorso ? "Invio in corso…" : "Invia"}
        </Pulsante>
      </div>
    </form>
  );
}

function Campo({
  id,
  etichetta,
  errore,
  children,
}: {
  id: string;
  etichetta: string;
  errore?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={s.campo} data-errore={errore ? "" : undefined}>
      <label htmlFor={id} className={s.etichetta}>
        {etichetta} <span aria-hidden="true">*</span>
      </label>
      {children}
      {errore && (
        <p id={`${id}-errore`} className={s.errore}>
          {errore}
        </p>
      )}
    </div>
  );
}
