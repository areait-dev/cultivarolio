import "server-only";
import { Resend } from "resend";

type Mail = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Nome visualizzato del mittente: l'indirizzo resta quello di MAIL_FROM. */
  nomeMittente?: string;
};

/** Escape HTML per ogni valore inserito dall'utente prima di metterlo in una email. */
export function esc(valore: string): string {
  return valore
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Estrae l'indirizzo da "Nome <a@b.it>" oppure da "a@b.it". */
function indirizzo(mittente: string): string {
  return mittente.match(/<([^>]+)>/)?.[1].trim() ?? mittente.trim();
}

/**
 * Invio con Resend. Variabili: RESEND_API_KEY, MAIL_FROM (es. "Cultivar Olio <info@cultivarolio.it>").
 * In sviluppo, senza RESEND_API_KEY, la mail viene solo scritta nel log; in produzione manca = errore.
 */
export async function sendMail({ to, subject, html, text, replyTo, nomeMittente }: Mail): Promise<void> {
  const chiave = process.env.RESEND_API_KEY;
  const mittente = process.env.MAIL_FROM;

  if (!chiave) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY mancante: invio email non configurato");
    }
    console.info("[mailer] (sviluppo, nessun invio reale)", { to, subject, replyTo });
    return;
  }
  if (!mittente) throw new Error("MAIL_FROM mancante (es. \"Cultivar Olio <info@cultivarolio.it>\")");

  const resend = new Resend(chiave);
  const { error } = await resend.emails.send({
    from: nomeMittente ? `${nomeMittente} <${indirizzo(mittente)}>` : mittente,
    to: Array.isArray(to) ? to : [to],
    subject: subject.replace(/[\r\n]+/g, " ").trim(),
    html,
    text,
    ...(replyTo ? { replyTo } : {}),
  });
  if (error) throw new Error(`Resend: ${error.name} – ${error.message}`);
}
