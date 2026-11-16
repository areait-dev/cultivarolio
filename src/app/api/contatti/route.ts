import { NextResponse } from "next/server";
import { z } from "zod";
import { inviaMessaggio } from "@/lib/email";
import { getTesti } from "@/lib/dati-sito";
import type { Campo, StatoModulo } from "@/app/contatti/modello";

const CAMPI: Campo[] = ["nome", "email", "messaggio", "consenso"];

const risposta = (corpo: StatoModulo, status = 200) => NextResponse.json(corpo, { status });

/** Stessa origine del sito: il modulo si invia solo dalle nostre pagine. */
function origineAmmessa(request: Request): boolean {
  const origine = request.headers.get("origin");
  if (!origine) return true; // chiamate server-to-server / strumenti
  try {
    return new URL(origine).host === (request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!origineAmmessa(request)) return risposta({ esito: "errore", messaggio: "Richiesta non consentita." }, 403);

  let dati: unknown;
  try {
    dati = await request.json();
  } catch {
    return risposta({ esito: "errore", messaggio: "Richiesta non valida." }, 400);
  }

  // Honeypot: i bot compilano il campo nascosto. Si risponde "ok" senza inviare nulla.
  if (typeof (dati as { sito_web?: unknown })?.sito_web === "string" && (dati as { sito_web: string }).sito_web) {
    return risposta({ esito: "ok", messaggio: "Grazie, abbiamo ricevuto il tuo messaggio." });
  }

  const { contatti } = await getTesti();
  const schema = z.object({
    nome: z.string().trim().min(1, "Inserisci nome e cognome.").max(200, "Il nome è troppo lungo."),
    email: z.string().trim().max(254).pipe(z.email("Inserisci un indirizzo email valido.")),
    profilo: z.string().trim().refine((p) => contatti.profili.includes(p), "Profilo non valido."),
    messaggio: z
      .string()
      .trim()
      .min(10, "Scrivi il tuo messaggio (almeno 10 caratteri).")
      .max(5000, "Il messaggio è troppo lungo (massimo 5000 caratteri)."),
    consenso: z.literal(true, { error: "Serve il consenso per inviare il messaggio." }),
  });

  const grezzo = (dati && typeof dati === "object" ? dati : {}) as Record<string, unknown>;
  const esito = schema.safeParse({
    nome: grezzo.nome ?? "",
    email: grezzo.email ?? "",
    profilo: grezzo.profilo ?? contatti.profili.at(-1) ?? "",
    messaggio: grezzo.messaggio ?? "",
    consenso: grezzo.consenso === true || grezzo.consenso === "on",
  });

  if (!esito.success) {
    const errori: StatoModulo["errori"] = {};
    for (const problema of esito.error.issues) {
      const campo = String(problema.path[0]);
      if (CAMPI.includes(campo as Campo)) errori[campo as Campo] ??= problema.message;
    }
    // un errore sul profilo non ha un campo proprio nel modulo: si mostra sul messaggio, se non ne ha già uno
    const erroreProfilo = esito.error.issues.find((p) => p.path[0] === "profilo");
    if (erroreProfilo) errori.messaggio ??= erroreProfilo.message;
    return risposta(
      {
        esito: "errore",
        messaggio: "Controlla i campi evidenziati.",
        errori,
        valori: {
          nome: String(grezzo.nome ?? ""),
          email: String(grezzo.email ?? ""),
          profilo: String(grezzo.profilo ?? ""),
          messaggio: String(grezzo.messaggio ?? ""),
        },
      },
      422,
    );
  }

  try {
    await inviaMessaggio(esito.data);
    return risposta({
      esito: "ok",
      messaggio: "Grazie, abbiamo ricevuto il tuo messaggio. Ti risponderemo al più presto.",
    });
  } catch (e) {
    console.error("[contatti] invio non riuscito", e);
    return risposta(
      {
        esito: "errore",
        messaggio: "Non siamo riusciti a inviare il messaggio. Riprova tra poco o scrivici via email.",
        valori: esito.data,
      },
      502,
    );
  }
}
