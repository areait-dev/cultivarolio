import "server-only";

export type MessaggioContatto = {
  nome: string;
  email: string;
  profilo: string;
  messaggio: string;
};

/**
 * Invio del modulo contatti.
 * TODO: collegare il servizio scelto (Resend, Postmark, SMTP aziendale…).
 * Esempio con Resend:
 *
 *   const r = await fetch("https://api.resend.com/emails", {
 *     method: "POST",
 *     headers: { Authorization: `Bearer ${process.env.EMAIL_API_KEY}`, "Content-Type": "application/json" },
 *     body: JSON.stringify({
 *       from: "Cultivar <sito@dominio-verificato.it>",
 *       to: process.env.CONTATTI_DESTINATARIO,
 *       reply_to: m.email,
 *       subject: `Contatto dal sito – ${m.profilo}`,
 *       text: `${m.nome} <${m.email}>\nProfilo: ${m.profilo}\n\n${m.messaggio}`,
 *     }),
 *   });
 *   if (!r.ok) throw new Error(`Email: ${r.status}`);
 */
export async function inviaMessaggio(m: MessaggioContatto): Promise<void> {
  if (!process.env.EMAIL_API_KEY) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("EMAIL_API_KEY mancante: invio del modulo contatti non configurato");
    }
    console.info("[contatti] (sviluppo, nessun invio reale)", { ...m, messaggio: m.messaggio.slice(0, 80) });
    return;
  }
  throw new Error("Servizio email non ancora implementato in src/lib/email.ts");
}
