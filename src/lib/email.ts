import "server-only";

export type MessaggioContatto = {
  nome: string;
  email: string;
  profilo: string;
  messaggio: string;
};

const sicuro = (t: string) => t.replace(/[\r\n]+/g, " ").trim();

/**
 * Invio del modulo contatti con Resend (API REST, nessun SDK).
 * Variabili: EMAIL_API_KEY, EMAIL_FROM (mittente su dominio verificato in Resend, es. "Cultivar <sito@cultivarolio.it>"),
 * CONTATTI_DESTINATARIO. In sviluppo, senza EMAIL_API_KEY, il messaggio viene solo scritto nel log.
 */
export async function inviaMessaggio(m: MessaggioContatto): Promise<void> {
  const chiave = process.env.EMAIL_API_KEY;
  if (!chiave) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("EMAIL_API_KEY mancante: invio del modulo contatti non configurato");
    }
    console.info("[contatti] (sviluppo, nessun invio reale)", { ...m, messaggio: m.messaggio.slice(0, 80) });
    return;
  }
  const destinatario = process.env.CONTATTI_DESTINATARIO;
  const mittente = process.env.EMAIL_FROM;
  if (!destinatario || !mittente) throw new Error("CONTATTI_DESTINATARIO o EMAIL_FROM mancante");

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chiave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: mittente,
      to: [destinatario],
      reply_to: m.email,
      subject: `Contatto dal sito – ${sicuro(m.profilo)} – ${sicuro(m.nome)}`,
      text: `${m.nome} <${m.email}>\nProfilo: ${m.profilo}\n\n${m.messaggio}`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
}
