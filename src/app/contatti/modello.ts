/** Tipi condivisi tra il modulo (client) e l'API /api/contatti (server). */
export type Campo = "nome" | "email" | "messaggio" | "consenso";
export type StatoModulo = {
  esito: "inattivo" | "ok" | "errore";
  messaggio?: string;
  errori?: Partial<Record<Campo, string>>;
  valori?: { nome?: string; email?: string; profilo?: string; messaggio?: string };
};
