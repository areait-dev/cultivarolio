"use server";

import { inviaMessaggio } from "@/lib/email";
import { PROFILI, type StatoModulo } from "./modello";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function inviaContatto(_prec: StatoModulo, dati: FormData): Promise<StatoModulo> {
  const nome = String(dati.get("nome") ?? "").trim();
  const email = String(dati.get("email") ?? "").trim();
  const profilo = String(dati.get("profilo") ?? "Altro");
  const messaggio = String(dati.get("messaggio") ?? "").trim();
  const consenso = dati.get("consenso") === "on";
  const trappola = String(dati.get("sito_web") ?? ""); // honeypot anti-spam

  const valori = { nome, email, profilo, messaggio };

  if (trappola) return { esito: "ok", messaggio: "Grazie, abbiamo ricevuto il tuo messaggio." };

  const errori: StatoModulo["errori"] = {};
  if (!nome) errori.nome = "Inserisci nome e cognome.";
  if (!EMAIL.test(email)) errori.email = "Inserisci un indirizzo email valido.";
  if (messaggio.length < 10) errori.messaggio = "Scrivi il tuo messaggio (almeno 10 caratteri).";
  if (messaggio.length > 5000) errori.messaggio = "Il messaggio è troppo lungo (massimo 5000 caratteri).";
  if (!consenso) errori.consenso = "Serve il consenso per inviare il messaggio.";
  if (!PROFILI.includes(profilo as (typeof PROFILI)[number])) errori.messaggio ??= "Profilo non valido.";

  if (Object.keys(errori).length) {
    return { esito: "errore", messaggio: "Controlla i campi evidenziati.", errori, valori };
  }

  try {
    await inviaMessaggio({ nome, email, profilo, messaggio });
    return { esito: "ok", messaggio: "Grazie, abbiamo ricevuto il tuo messaggio. Ti risponderemo al più presto." };
  } catch (e) {
    console.error("[contatti] invio non riuscito", e);
    return {
      esito: "errore",
      messaggio: "Non siamo riusciti a inviare il messaggio. Riprova tra poco o scrivici via email.",
      valori,
    };
  }
}
