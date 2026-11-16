# Cultivar – Storie di Olio d’Oliva IGP di Sicilia

Sito del progetto di Promotergroup S.p.A., cofinanziato dalla Regione Siciliana ("Sicilia che piace 2026").
Next.js 16 (App Router), React 19, TypeScript strict, CSS custom properties + CSS Modules. Nessuna libreria UI, nessun Tailwind.

## Comandi

```bash
npm install
npm run dev        # sviluppo su http://localhost:3000
npm run typecheck  # controllo dei tipi
npm run build      # build di produzione
npm start          # serve la build
```

Copia `.env.example` in `.env.local` e compila le variabili.

## Struttura

```
src/
  app/                    pagine (App Router)
    page.tsx              home
    il-progetto/ documentari/ contatti/ privacy/ cookie/
    blog/                 elenco, [slug] (articolo), categoria/[slug] (filtri, vedi sotto)
    design-system/        pagina di consultazione (noindex)
    contatti/azioni.ts    Server Action del modulo ("use server": solo funzioni async)
    contatti/modello.ts   costanti e tipi condivisi tra modulo e azione
    sitemap.ts robots.ts not-found.tsx fonts.ts layout.tsx
  components/             componenti (ognuno con il suo .module.css)
  lib/
    testi.ts              testi delle pagine statiche (dal docx del cliente)
    site.ts               recapiti, social, cofinanziamento, navigazione
    seo.ts                metadata + Open Graph per pagina
    email.ts              invio del modulo contatti (TODO)
    content/              interfaccia ContentSource + adattatori CMS
  styles/tokens.css       token a tre livelli
  styles/base.css         reset, superfici, layout
public/ forme/ illustrazioni/ logo/ og.png
```

### Token e stili

Tre livelli in `src/styles/tokens.css`: **primitivi** (colori grezzi) → **semantici** (`--superficie`, `--testo`,
`--testo-tenue`, `--focus`, `--errore`…) → classi `.superficie-bone/kraft/lilla/verde/carbone` che ridefiniscono i
semantici. I componenti usano solo i semantici. Niente stili inline nelle pagine.
La pagina `/design-system` mostra palette, contrasti (calcolati dal CSS), scala tipografica, spaziature, forme,
pulsanti, schede, modulo e illustrazioni.

### Filtri del blog

I filtri sono link `/blog?categoria=filiera` e funzionano senza JavaScript. Per poterli servire come pagine statiche
(ISR), `next.config.ts` riscrive `/blog?categoria=x` verso `/blog/categoria/x`; l'URL nel browser non cambia.
La rotta interna è `noindex`.

### Testi e contenuti

Testi, documentari, articoli, recapiti e note legali si gestiscono in **WordPress headless** (ACF free, REST nativa):
vedi **[README-MIGRAZIONE.md](README-MIGRAZIONE.md)** per installazione, campi e checklist.

- `src/lib/testi.ts` e `src/lib/site.ts` restano come **testi di riserva**: si usano solo se WordPress non risponde
  o un campo è vuoto (il build non si rompe). Gli errori del documento originale sono marcati `REFUSO`.
- Senza `NEXT_PUBLIC_WP_API_URL` il sito usa il mock (`src/lib/content/adapters/mock.ts`) e i testi di riserva.
  Attenzione: un `.env.local` con `CMS_PROVIDER=mock` forza il mock anche se l'URL di WordPress è impostato.

## Collegamento a WordPress

Le pagine non chiamano mai WordPress direttamente: usano `src/lib/content` (articoli, documentari, categorie) e
`src/lib/dati-sito.ts` (testi, recapiti, SEO, note legali). Il client REST è `src/lib/wordpress.ts`.

- `acf-json/` field group ACF (generati da `npm run acf:genera`), `mu-plugins/` da copiare in `wp-content/mu-plugins`.
- `/api/revalidate` e `/api/preview` sono chiamati da WordPress; `/api/contatti` riceve il modulo (zod + Resend).
- ISR di sicurezza: 1 ora (pagine), 10 minuti (elenco blog). L'aggiornamento vero arriva dal webhook di WordPress.
- `npm run wp:testi` e `npm run wp:articolo` rigenerano i testi da incollare in WordPress (`contenuti-wp/`).

## Cambiare font

I font sono self-hosted con `next/font/local` in `src/app/fonts.ts` (nessuna richiesta a Google Fonts).
- **Testo**: Poppins. **Display**: BD Plakatt (carattere del marchio), in `src/app/fonts/bd-plakatt-cultivar.woff2`.
- Il file originale (`bdplakatt.ttf`) contiene solo A–Z, a–z e 0–9. Punteggiatura e lettere accentate (è, à, ò, ù, È…)
  sono disegnate da `scripts/estendi-font.py` con lo stesso spessore e bordo ruvido: è una **soluzione ponte** da far
  rifinire al type designer. I caratteri non coperti (es. `&`, `%`, `@`, `€`) passano al carattere di sistema.
- Per rigenerare: `pip install fonttools brotli` poi
  `python scripts/estendi-font.py "percorso/bdplakatt.ttf" src/app/fonts/bd-plakatt-cultivar.woff2`.
- Se arriva il font ufficiale completo, sostituisci il file e togli lo script. Controlla le interlinee in `/design-system`.
- **Licenza**: verifica che la licenza consenta uso web e modifica del file.
- I titoli display sono in minuscolo solo via CSS: nel contenuto le maiuscole restano corrette.

## Attivare l’invio email del modulo contatti

Il modulo invia JSON a `/api/contatti` (zod, honeypot, controllo origine); l'invio è in `src/lib/email.ts` + `src/lib/mailer.ts` (Resend).
Arrivano due email: la notifica a `CONTATTI_DESTINATARIO` (replyTo = email dell'utente) e la conferma automatica all'utente.
In produzione, senza `EMAIL_API_KEY`, il modulo mostra "Non siamo riusciti a inviare il messaggio"; in sviluppo scrive solo in console.

1. Verifica il dominio mittente in Resend (SPF/DKIM).
2. Imposta `EMAIL_API_KEY`, `EMAIL_FROM` e `CONTATTI_DESTINATARIO` (in locale `.env.local`, su Vercel Production e Preview) e rifai il deploy.
3. Per provare: `npm run dev`, invia il modulo su /contatti e controlla le due caselle.
4. Valuta un limite di richieste (rate limit) o un captcha rispettoso della privacy se arriva spam.

## Video

I video YouTube sono "a facciata" (`VideoYouTube`): finché non si preme play non si carica nulla. Al click viene
chiesto il consenso per quel video, oppure è globale se accettato dal banner. Si usa `youtube-nocookie.com`.
Per attivare un episodio basta valorizzare `youtubeId` (e `dataPubblicazione`, che serve ai dati strutturati
VideoObject) nel CMS. Le copertine vanno servite dal sito, non da `i.ytimg.com`.

## Checklist pre-lancio

- [ ] **Sito in costruzione**: oggi il sito pubblico mostra solo la pagina "in costruzione" (immagini in `public/in-costruzione-*.png`). Dopo l’approvazione: impostare `SITO_PUBBLICO=1` su Vercel e rifare il deploy.
- [ ] **CUP** del progetto: `site.cofinanziamento.cup` in `src/lib/site.ts` (obbligatorio: finché è `null` il footer non mostra la riga CUP).
- [ ] **Logo Regione Siciliana** nel footer: oggi è `public/logo/regione-siciliana.svg`, copiato da un altro progetto. Farlo confermare dal cliente o dalla Regione (versione ufficiale e regole d’uso).
- [ ] **URL reali dei social** in `site.social` (ora sono le home dei portali).
- [ ] **Testi legali**: `privacy` e `cookie` sono bozze; farli validare dal legale e togliere `<NotaBozza />`. Completare tempi di conservazione e fornitore email.
- [ ] **Servizio email** collegato e provato con un invio reale.
- [ ] **Dominio**: impostare `NEXT_PUBLIC_SITE_URL` (metadata, sitemap, Open Graph, canonical).
- [ ] **Refusi del docx** corretti in `src/lib/testi.ts` (cerca `REFUSO`) e testi mancanti (titoli e durate episodi, nomi dei partner nella frase sull’ospitalità, articoli).
- [ ] **Contenuti veri** al posto del mock: episodi con `youtubeId`, articoli, copertine.
- [ ] **Font** BD Plakatt: licenza web e modifica verificate; segni aggiunti rifiniti dal type designer.
- [ ] **Immagine di condivisione** `public/og.png` (1200×630): oggi è una versione provvisoria con logo e ramo d’olivo.
- [ ] Prova finale: tastiera, mobile, lettore di schermo sulle pagine principali.
