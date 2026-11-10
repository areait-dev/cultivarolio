/** Condiviso tra il modulo (client) e l'azione (server). */
export const PROFILI = ["Consumatore", "Buyer", "Operatore Ho.Re.Ca.", "Produttore", "Stampa", "Altro"] as const;

export type Campo = "nome" | "email" | "messaggio" | "consenso";
export type StatoModulo = {
  esito: "inattivo" | "ok" | "errore";
  messaggio?: string;
  errori?: Partial<Record<Campo, string>>;
  valori?: { nome?: string; email?: string; profilo?: string; messaggio?: string };
};

