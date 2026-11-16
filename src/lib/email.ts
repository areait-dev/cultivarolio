import "server-only";
import { esc, sendMail } from "@/lib/mailer";

export type MessaggioContatto = {
  nome: string;
  email: string;
  profilo: string;
  messaggio: string;
};

const riga = (t: string) => t.replace(/[\r\n]+/g, " ").trim();
/** Nome per il mittente: senza < > " e a capo, massimo 60 caratteri. */
const nomePulito = (t: string) =>
  t.replace(/[<>"\r\n]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 60).trim();
const dataOra = () =>
  new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Rome" }).format(new Date());

const cornice = (corpo: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1c1c1a;max-width:600px">${corpo}</div>`;

/**
 * Modulo contatti: notifica a MAIL_TO_ADMIN (replyTo = email dell'utente)
 * + conferma automatica all'utente. La conferma è "best effort": se fallisce non fa fallire l'invio.
 */
export async function inviaMessaggio(m: MessaggioContatto): Promise<void> {
  const admin = process.env.MAIL_TO_ADMIN;
  if (!admin && process.env.NODE_ENV === "production") throw new Error("MAIL_TO_ADMIN mancante");
  const quando = dataOra();

  await sendMail({
    to: admin ?? "info@cultivarolio.it",
    replyTo: m.email,
    nomeMittente: `${nomePulito(m.nome) || "Sito"} via Cultivar Olio`,
    subject: `Nuovo messaggio dal sito – ${riga(m.nome)}`,
    text: `Nuovo messaggio dal sito (${quando})\n\nNome: ${m.nome}\nEmail: ${m.email}\nProfilo: ${m.profilo}\n\n${m.messaggio}\n`,
    html: cornice(
      `<h2 style="margin:0 0 12px">Nuovo messaggio dal sito</h2>
<p style="color:#666;margin:0 0 16px">${esc(quando)}</p>
<p><strong>Nome:</strong> ${esc(m.nome)}<br><strong>Email:</strong> ${esc(m.email)}<br><strong>Profilo:</strong> ${esc(m.profilo)}</p>
<p style="white-space:pre-wrap;border-left:3px solid #ccc;padding-left:12px">${esc(m.messaggio)}</p>`,
    ),
  });

  try {
    await sendMail({
      to: m.email,
      subject: "Abbiamo ricevuto il tuo messaggio – Cultivar Olio",
      text: `Ciao ${m.nome},\n\ngrazie per averci scritto: abbiamo ricevuto il tuo messaggio e ti risponderemo al più presto.\n\nEcco cosa ci hai inviato:\n\n${m.messaggio}\n\nCultivar Olio\nhttps://cultivarolio.it\n\nQuesta è una risposta automatica: puoi rispondere a questa email per scriverci.\n`,
      replyTo: admin ?? "info@cultivarolio.it",
      html: cornice(
        `<p>Ciao ${esc(m.nome)},</p>
<p>grazie per averci scritto: abbiamo ricevuto il tuo messaggio e ti risponderemo al più presto.</p>
<p style="color:#666;margin-bottom:4px">Ecco cosa ci hai inviato:</p>
<p style="white-space:pre-wrap;border-left:3px solid #ccc;padding-left:12px">${esc(m.messaggio)}</p>
<p>Cultivar Olio<br><a href="https://cultivarolio.it">cultivarolio.it</a></p>
<p style="color:#888;font-size:13px">Questa è una risposta automatica: puoi rispondere a questa email per scriverci.</p>`,
      ),
    });
  } catch (e) {
    console.error("[contatti] conferma all'utente non inviata", e);
  }
}
