"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { inviaContatto } from "@/app/contatti/azioni";
import { PROFILI, type StatoModulo } from "@/app/contatti/modello";
import { Pulsante } from "./Pulsante";
import { Ruvido } from "./Ruvido";
import s from "./ModuloContatti.module.css";

const iniziale: StatoModulo = { esito: "inattivo" };

/**
 * Modulo contatti con Server Action: funziona anche senza JavaScript
 * (invio classico), con JS mostra errori e conferma senza ricaricare.
 * La validazione vera è sul server; il browser fa solo da primo filtro.
 */
export function ModuloContatti() {
  const [stato, azione, inCorso] = useActionState(inviaContatto, iniziale);
  const riepilogo = useRef<HTMLDivElement>(null);
  const e = stato.errori ?? {};
  const v = stato.esito === "ok" ? {} : (stato.valori ?? {});

  // porta il focus sull'esito, così chi usa lettori di schermo lo sente subito
  useEffect(() => {
    if (stato.esito !== "inattivo") riepilogo.current?.focus();
  }, [stato]);

  return (
    <form action={azione} className={s.modulo} noValidate>
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
          {PROFILI.map((p) => (
            <label key={p} className={s.scelta}>
              <input type="radio" name="profilo" value={p} defaultChecked={(v.profilo ?? "Consumatore") === p} />
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

      <div>
        <Pulsante type="submit" disabled={inCorso} aria-disabled={inCorso}>
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
