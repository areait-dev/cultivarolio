import "server-only";

/**
 * Verifica il token di Cloudflare Turnstile inviato dal modulo.
 * Senza TURNSTILE_SECRET_KEY: in sviluppo si salta il controllo, in produzione si rifiuta (fail closed).
 */
export async function verificaTurnstile(token: unknown, ip?: string | null): Promise<boolean> {
  const segreto = process.env.TURNSTILE_SECRET_KEY;
  if (!segreto) {
    if (process.env.NODE_ENV === "production") console.error("[turnstile] TURNSTILE_SECRET_KEY mancante");
    return process.env.NODE_ENV !== "production";
  }
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const corpo = new URLSearchParams({ secret: segreto, response: token });
    if (ip) corpo.set("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: corpo,
      signal: AbortSignal.timeout(5000),
    });
    const d = (await r.json()) as { success?: boolean };
    return d.success === true;
  } catch (e) {
    console.error("[turnstile] verifica non riuscita", e);
    return false;
  }
}
