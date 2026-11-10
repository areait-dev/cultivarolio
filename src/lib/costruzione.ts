/**
 * Sito in costruzione: attivo di default. Tutte le pagine mostrano /in-costruzione, i motori di ricerca
 * non indicizzano nulla e testata, piè di pagina e banner non compaiono.
 * Per pubblicare il sito vero (dopo l'approvazione): impostare SITO_PUBBLICO=1 nell'ambiente e rifare il deploy.
 */
export const inCostruzione = process.env.SITO_PUBBLICO !== "1";
