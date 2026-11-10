/**
 * Interruttore "sito in costruzione". Con SITO_IN_COSTRUZIONE=1 tutte le pagine mostrano /in-costruzione,
 * i motori di ricerca non indicizzano nulla e la testata e il piè di pagina non compaiono.
 * Per pubblicare il sito: togliere la variabile (o metterla a 0) e rifare il deploy.
 */
export const inCostruzione = process.env.SITO_IN_COSTRUZIONE === "1";
