/**
 * Testi delle pagine statiche, ripresi LETTERALMENTE da Testi_per_sito_web.docx.
 * Non vanno riscritti qui: se cambiano, si aggiorna questo file.
 *
 * REFUSO = errore presente nel docx, lasciato com'è in attesa della correzione del cliente.
 * (Cerca "REFUSO" per trovarli tutti.)
 */
export const testi = {
  home: {
    // Titolo del docx: "Cultivar. Storie di Olio d’Oliva IGP di Sicilia" (il nome è il logo, il resto è il sottotitolo display)
    titoloResto: "Storie di Olio d’Oliva IGP di Sicilia",
    sottotitolo:
      "Un viaggio nella Sicilia dell’olio extravergine d’oliva, raccontato attraverso i paesaggi, i sapori e i protagonisti della filiera",
    pulsanteDocumentari: "Guarda i documentari",
    pulsanteProgetto: "Scopri il progetto",
    breve: {
      titolo: "Il progetto in breve",
      paragrafi: [
        // REFUSO: «IPG» invece di IGP; virgolette di apertura e chiusura diverse (“ … ’)
        "Ogni Cultivar ha una storia da raccontare. È la storia di un paesaggio e di un clima, di gesti tramandati da generazioni e di saperi che si rinnovano. “Cultivar. Storie di Olio d’Oliva IPG di Sicilia’, raccoglie queste storie e le trasforma in un racconto multimediale per immagini.",
        "Un viaggio attraverso la Sicilia, dalla provincia di Ragusa a quella di Trapani passando per il Catanese, alla scoperta di ciò che rende unico l’Olio EVO Sicilia IGP.",
      ],
      pulsante: "Scopri di più",
    },
    documentari: {
      occhiello: "I documentari",
      titolo: "Storie di olio, storie di Sicilia",
      intro:
        "Tre documentari in arrivo per scoprire i territori, le esperienze e le tradizioni che si nascondono dietro l’eccellenza certificata dell’olio extravergine d’oliva IGP.",
      pulsante: "Vai ai documentari",
    },
    blog: {
      occhiello: "Dal blog",
      titolo: "Conoscere l’olio per sceglierlo meglio",
      link: "Tutti gli articoli",
    },
    invito: {
      testo: "Segui il racconto sul nostro canale YouTube e sui social.",
      pulsante: "Iscriviti al canale",
    },
  },

  progetto: {
    titolo: "Valorizzare la filiera attraverso le storie",
    introduzione:
      "Cultivar nasce da un’idea semplice. Un prodotto si capisce davvero quando se ne conosce la storia. Per questo racconta l’Olio Extra Vergine di Oliva Sicilia IGP non con uno spot, ma con le storie dei luoghi in cui nasce, delle persone che lo custodiscono e delle tradizioni che lo accompagnano. Il documentario è il formato scelto per farlo, un racconto lento e autentico, che lascia parlare i territori, le esperienze e i sapori.",
    obiettivi: {
      titolo: "Gli obiettivi",
      // Nel docx: "Valorizzare un’eccellenza certificata: far conoscere…". Il layout separa verbo / oggetto / descrizione;
      // la descrizione comincia con la maiuscola perché va a capo dopo i due punti.
      voci: [
        {
          verbo: "Valorizzare",
          oggetto: "un’eccellenza certificata",
          testo: "Far conoscere la qualità dell’Olio EVO Sicilia IGP, il suo profilo organolettico e nutrizionale.",
        },
        {
          verbo: "Promuovere",
          oggetto: "un consumo consapevole",
          testo:
            "Aiutare chi acquista a riconoscere il prodotto certificato, le sue cultivar, i suoi territori e la sua tracciabilità.",
        },
        {
          verbo: "Raccontare",
          oggetto: "l’innovazione della filiera",
          testo: "Tecnologia, efficienza energetica, sostenibilità ambientale e recupero dei sottoprodotti.",
        },
        {
          verbo: "Parlare",
          oggetto: "a pubblici diversi",
          testo: "Consumatori e giovani, buyer, operatori Ho.Re.Ca. e chi lavora nel settore, in Sicilia e in Italia.",
        },
      ],
    },
    storie: {
      titolo: "Cosa raccontano le storie",
      // Come sopra: nel docx la descrizione segue i due punti in minuscolo; qui comincia con la maiuscola.
      voci: [
        {
          titolo: "I luoghi",
          testo:
            "I territori, i paesaggi, gli uliveti e i borghi di tre aree della Sicilia, fino agli spazi in cui l’olio prende forma.",
        },
        {
          titolo: "Le esperienze",
          testo: "Le voci e i mestieri di chi vive la filiera ogni giorno, dalla campagna al frantoio.",
        },
        {
          titolo: "I sapori",
          testo: "Le proprietà organolettiche, il gusto e la riconoscibilità dell’Olio EVO Sicilia IGP.",
        },
        {
          titolo: "Le pratiche innovazione e sostenibili", // REFUSO: forse "Le pratiche innovative e sostenibili"
          // REFUSO: "Temi coerenti della Strategia" (forse "con la")
          testo:
            "L’efficienza energetica, l’eco-innovazione e il recupero dei residui di molitura, per una filiera che guarda all’economia circolare e alla riduzione degli impatti ambientali. Temi coerenti della Strategia di Specializzazione Intelligente della Regione Siciliana (S3 Sicilia).",
        },
      ],
    },
    territori: {
      titolo: "I territori del racconto",
      testo:
        "Il viaggio di Cultivar attraversa tre territori siciliani: Chiaramonte Gulfi, in provincia di Ragusa; Mirabella Imbaccari, in provincia di Catania; Partanna, in provincia di Trapani. Tre paesaggi diversi, una stessa cultura dell’olio.",
    },
    chi: {
      titolo: "Chi realizza il progetto",
      realizzazione:
        "Cultivar è un progetto di Promotergroup S.p.A., realizzato con il sostegno della Regione Siciliana – Dipartimento delle Attività Produttive, nell’ambito dell’Avviso “Sicilia che piace 2026 – Soggetti Privati”.",
      consorzio:
        "Il progetto è realizzato con la partecipazione istituzionale del Consorzio per la Tutela e la Valorizzazione dell’Olio Extra Vergine di Oliva Sicilia IGP, a garanzia della rappresentatività della filiera e della correttezza delle informazioni sul prodotto certificato.",
    },
  },

  documentari: {
    titolo: "Storie di olio, storie di Sicilia",
    intro:
      "Tre video-documentari di 15–20 minuti, per un viaggio in tre territori siciliani. Ogni episodio racconta un luogo, le sue tradizioni e le esperienze di chi lo vive, fino ai profumi e ai sapori dell’Olio Extra Vergine di Oliva Sicilia IGP.",
    etichette: { territorio: "Territorio", durata: "Durata" },
    invito: "Non perderti le prossime storie: iscriviti al canale YouTube di Cultivar.",
    pulsante: "Iscriviti al canale",
  },

  blog: {
    titolo: "Il Blog di Cultivar",
    intro:
      "Approfondimenti per conoscere meglio l’Olio Extra Vergine di Oliva Sicilia IGP: come nasce, come si riconosce, come si gusta e quali storie lo accompagnano.",
    elenco: "Ultimi articoli",
  },

  contatti: {
    // Il docx non ha un titolo per la pagina: uso l'etichetta del menu.
    titolo: "Contatti",
    intro: "Vuoi saperne di più sul progetto o ricevere informazioni? Scrivici: ti risponderemo al più presto.",
  },
} as const;
