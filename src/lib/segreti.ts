import "server-only";
import { timingSafeEqual } from "node:crypto";

/** Confronto a tempo costante di due segreti (token, secret). False se uno dei due manca. */
export function segretoValido(ricevuto: string | null | undefined, atteso: string | undefined): boolean {
  if (!ricevuto || !atteso) return false;
  const a = Buffer.from(ricevuto);
  const b = Buffer.from(atteso);
  return a.length === b.length && timingSafeEqual(a, b);
}
