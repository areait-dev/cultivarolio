# Migrazione a WordPress headless

WordPress è usato **solo come CMS**: il sito pubblico resta Next.js. Architettura:

- **ACF free** (nessun repeater, flexible content, gallery, clone, Options Page) + **Yoast SEO**. Niente CPT UI.
- **REST nativa** `/wp-json/wp/v2` (niente GraphQL). I campi ACF arrivano nella proprietà `acf`, i meta SEO in `yoast_head_json`.
- **CPT registrati da codice** (mu-plugin): `articolo`, `documentario`, tassonomia `categoria_articolo`.
- **Aggiornamento immediato**: quando salvi un contenuto WordPress avvisa `/api/revalidate`; l'ISR a tempo è solo una rete di sicurezza.
- **Modulo contatti**: API route Next (`/api/contatti`) con validazione zod e invio email con Resend. Non salva nulla su WordPress.

> **Stato della verifica.** Il frontend è stato provato contro un finto WordPress (build, pagine, ISR, anteprima, API, fallback
> con WordPress spento). I due file PHP (`mu-plugins/`) **non sono stati eseguiti**: non c'era PHP né WordPress a disposizione.
> Esegui con attenzione la checklist in fondo (passo 12) al primo collegamento.

## Cosa c'è nel repository

| Percorso | Cosa fa |
|---|---|
| `acf-json/*.json` | 9 field group ACF (chiavi stabili `group_cultivar_*` / `field_cultivar_*`, `show_in_rest: 1`). Generati da `npm run acf:genera` |
| `mu-plugins/cultivar-setup.php` | CPT, tassonomia + termini fissi, regola ACF «Slug pagina», CORS, hardening, revalidate, pulsante «Vedi nel frontend» |
| `mu-plugins/headless-redirect.php` | 301 del frontend WordPress verso il sito, `X-Robots-Tag: noindex, nofollow` ovunque |
| `src/lib/wordpress.ts` | Fetch tipizzate e normalizzate, con fallback sicuro se WordPress non risponde |
| `src/lib/dati-sito.ts` | Testi, recapiti, SEO e note legali dalle pagine WordPress (campo vuoto → testo di riserva) |
| `src/lib/html-blocchi.ts` | HTML dell'editor → blocchi dell'articolo (parser vero, non regex) |
| `src/lib/paths.ts` | Mappa contenuto WordPress → percorso pubblico (revalidate e anteprima) |
| `src/app/api/{revalidate,preview,contatti}` | Webhook, anteprima bozze, modulo contatti |
| `contenuti-wp/` | Testi pronti da incollare: `testi-pagine.md`, `articolo-28-cultivar.html`, `privacy.html`, `cookie.html` |

## 1. Domini

| Ruolo | Dominio | Dove è usato |
|---|---|---|
| WordPress (CMS) | `wp.cultivarolio.it` | `NEXT_PUBLIC_WP_API_URL` (`https://wp.cultivarolio.it/wp-json/wp/v2`); `next.config.ts` ricava da lì il dominio delle immagini |
| Sito pubblico (Vercel) | `cultivarolio.it` | `NEXT_URL` in `wp-config.php`, CORS, redirect 301, `EMAIL_FROM`, `NEXT_PUBLIC_SITE_URL` |

I due mu-plugin hanno `cultivarolio.it` come valore di riserva se `NEXT_URL` non è definita. Se il sito pubblico fosse invece
`www.cultivarolio.it`, cambia `NEXT_URL`, `NEXT_PUBLIC_SITE_URL` e le costanti di riserva nei due mu-plugin.

## 2. Requisiti WordPress

- WordPress 6.4+, PHP 8.1+, HTTPS.
- Plugin: **ACF free 5.9+** (la regola «Slug pagina» richiede 5.9) e **Yoast SEO**. Nessun altro.
- Impostazioni → Permalink: «Nome articolo», poi **Salva** (ricarica le regole dei CPT).

## 3. wp-config.php

Prima di `/* That's all, stop editing! */`:

```php
define( 'NEXT_URL', 'https://cultivarolio.it' );     // senza slash finale
define( 'WP_REVALIDATE_TOKEN', 'stringa-lunga-casuale-1' );
define( 'WP_PREVIEW_SECRET', 'stringa-lunga-casuale-2' );
```

Genera i due valori con `openssl rand -hex 32`. Gli stessi valori vanno su Vercel (passo 9).

## 4. Installare mu-plugin e campi ACF

1. Copia `mu-plugins/cultivar-setup.php` e `mu-plugins/headless-redirect.php` in `wp-content/mu-plugins/`.
2. Copia la cartella `acf-json/` in `wp-content/acf-json/`.
3. WordPress → Campi personalizzati → Gruppi di campi → scheda **Sincronizzazione disponibile** → seleziona tutti → **Sync**.
   Devono comparire 9 gruppi (Documentario, Articolo del blog, Pagina · Home, Il progetto, Documentari, Blog, Contatti,
   Note legali, Opzioni globali).

Se cambi i campi: modifica `scripts/genera-acf-json.mjs`, esegui `npm run acf:genera`, committa e rifai **Sync**.
Le chiavi sono stabili: i contenuti già inseriti non si perdono.

## 5. Creare le pagine (slug esatti)

Pagine → Aggiungi. Titolo qualsiasi; **lo slug deve essere questo** (il mu-plugin lo assegna dal titolo al primo
salvataggio come bozza: controlla che sia giusto). I campi compaiono appena la pagina ha lo slug.

| Slug | Titolo suggerito | Campi |
|---|---|---|
| `home` | Home | gruppo «Pagina · Home» |
| `il-progetto` | Il progetto | gruppo «Pagina · Il progetto» |
| `documentari` | Documentari | gruppo «Pagina · Documentari» |
| `blog` | Blog | gruppo «Pagina · Blog» |
| `contatti` | Contatti | gruppo «Pagina · Contatti» (con `profili`) |
| `privacy` | Privacy policy | editor + «Note legali» |
| `cookie` | Cookie policy | editor + «Note legali» |
| `opzioni-globali` | Opzioni globali | gruppo «Pagina · Opzioni globali» (non visibile sul sito) |

I testi attuali, campo per campo, sono in `contenuti-wp/testi-pagine.md` (rigenerabile con `npm run wp:testi`).
Un campo lasciato vuoto usa il testo di riserva del codice, quindi si può procedere pagina per pagina.

Le liste sono textarea «una voce per riga»: `Verbo | Oggetto | Descrizione` per gli obiettivi, `Titolo | Descrizione` per le
storie (le prime tre vanno in colonna, la quarta è in evidenza), un profilo per riga nei contatti.

### Note legali (privacy e cookie)

Incolla `contenuti-wp/privacy.html` e `contenuti-wp/cookie.html` nell'editor in modalità **Codice** (o in un blocco «HTML personalizzato»).
Segnaposto sostituiti dal sito con i dati di «Opzioni globali»: `{{ragione_sociale}}`, `{{sede}}`, `{{piva}}`, `{{email}}`, `{{telefono}}`;
`{{riapri_consenso}}` diventa il pulsante «Preferenze cookie». Il campo «Mostra la nota Bozza da validare» è attivo: il legale lo
disattiva quando ha approvato il testo. Tag ammessi: `h2 h3 h4 p br a strong em code ul ol li blockquote`; il resto viene ripulito.

## 6. Contenuti

- **Documentari** (3): Documentari → Aggiungi. Titolo = città, **Ordine** (Attributi) = 1, 2, 3. Luogo, partner e illustrazione sono in
  `contenuti-wp/testi-pagine.md`. Durata e ID YouTube vuoti finché il video non è pronto («In arrivo»).
  `Titolo e testi provvisori` resta attivo fino alla versione definitiva.
- **Articolo «Le 28 cultivar»**: Articoli del blog → Aggiungi. Incolla `contenuti-wp/articolo-28-cultivar.html` nell'editor in modalità
  Codice; categoria «Conoscere l'olio»; illustrazione `foglie-carbone`; data 13/11/2026; estratto:
  «Biancolilla, Cerasuola, Nocellara del Belice, Tonda Iblea: le 28 cultivar del disciplinare e i territori che raccontano.»
- **Corpo degli articoli**: H2 = titolo, H3 = sottotitolo, citazione, elenchi puntati e numerati, immagini. Un tag non previsto
  (tabelle, ecc.) diventa un paragrafo di solo testo: non si perde, ma perde la forma. Immagini: servono larghezza e altezza,
  il sito le prende dall'HTML o dalla libreria media (nessun salto di layout).
- Categorie: create dal mu-plugin con slug fissi `conoscere-l-olio`, `filiera`, `territori`, `degustazione`. Non cambiare gli slug.

## 7. Yoast SEO

Il sito legge titolo e descrizione da `yoast_head_json` (articoli e pagine) e li usa **così come sono**: il titolo Yoast è
già completo. Imposta in Yoast il modello del titolo (es. `%%title%% %%sep%% Cultivar`) e scrivi la descrizione sulle pagine
importanti. Se Yoast non ha dati, restano quelli del codice.

## 8. Utente per l'anteprima

Utenti → Aggiungi nuovo: nome `anteprima-sito`, **ruolo Editor**. Poi sul suo profilo → *Password per le applicazioni* →
nome `Next.js anteprima` → copia la password generata (con gli spazi). Servono a `WP_PREVIEW_USER` e `WP_PREVIEW_APP_PASSWORD`.
Il pulsante **Vedi nel frontend** nella barra amministratore apre `/api/preview` e mostra la bozza sul sito; per uscire
dall'anteprima apri `/api/preview/esci`.

## 9. Variabili su Vercel

| Variabile | Valore |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://cultivarolio.it` |
| `NEXT_PUBLIC_WP_API_URL` | `https://wp.cultivarolio.it/wp-json/wp/v2` |
| `WP_REVALIDATE_TOKEN` | = `WP_REVALIDATE_TOKEN` di wp-config.php |
| `WP_PREVIEW_SECRET` | = `WP_PREVIEW_SECRET` di wp-config.php |
| `WP_PREVIEW_USER`, `WP_PREVIEW_APP_PASSWORD` | passo 8 — **solo lato server, mai `NEXT_PUBLIC_`** |
| `EMAIL_API_KEY`, `EMAIL_FROM`, `CONTATTI_DESTINATARIO` | passo 10 |
| `SITO_PUBBLICO` | `1` solo quando il sito deve uscire dalla pagina «in costruzione» |

In locale: copia `.env.example` in `.env.local`. **Togli `CMS_PROVIDER=mock`** dal tuo `.env.local`, altrimenti il sito
continua a usare il mock anche con WordPress configurato.

Finché `SITO_PUBBLICO` non è `1`, il sito mostra «in costruzione»; `/api/revalidate`, `/api/preview` e `/api/contatti`
restano raggiungibili (esclusi in `src/proxy.ts`).

## 10. Modulo contatti (Resend)

1. Crea un account Resend e **verifica il dominio** `cultivarolio.it` (record DNS).
2. `EMAIL_API_KEY` = chiave API; `EMAIL_FROM` = `Cultivar Olio <info@cultivarolio.it>`; `CONTATTI_DESTINATARIO` = `info@cultivarolio.it`. Il modulo invia la notifica e una conferma automatica all'utente.
3. In produzione, senza chiave, il modulo risponde con errore (non finge di inviare). In sviluppo scrive solo nel log.

Differenza rispetto a prima: il modulo ora richiede JavaScript (invia in JSON a `/api/contatti`); non c'è più l'invio senza JS.
I profili «Chi sei» vengono dalla pagina Contatti e il server li ricontrolla.

## 11. Refusi del documento originale (lasciati com'erano)

Segnalati con `REFUSO` in `src/lib/testi.ts`, e quindi anche nei testi da incollare. Vanno corretti dal cliente **direttamente in WordPress**:

1. Home → «Il progetto in breve»: «IPG» invece di «IGP»; virgolette di apertura e chiusura diverse (`“ … ’`).
2. Il progetto → «Cosa raccontano le storie», quarta voce: «Le pratiche innovazione e sostenibili» (forse «innovative»).
3. Stessa voce: «Temi coerenti della Strategia» (forse «con la»).

## 12. Checklist di verifica

Dominio WordPress `wp.cultivarolio.it`, sito `cultivarolio.it`.

**WordPress (REST)**

- [ ] `curl -s "https://wp.cultivarolio.it/wp-json/wp/v2/categorie-articolo?per_page=20"` → 4 termini con gli slug fissi
- [ ] `curl -s "https://wp.cultivarolio.it/wp-json/wp/v2/documentari?orderby=menu_order&order=asc"` → 3 episodi, ciascuno con `acf.luogo`, `acf.partner`…
- [ ] `curl -s "https://wp.cultivarolio.it/wp-json/wp/v2/articoli?_embed=wp:featuredmedia,wp:term"` → l'articolo con `acf`, `yoast_head_json`, `_embedded`
- [ ] `curl -s "https://wp.cultivarolio.it/wp-json/wp/v2/pages?slug=home,opzioni-globali"` → `acf` con i gruppi annidati (`breve`, `sito`, `titolare`…)
- [ ] I campi image arrivano come oggetto con `url`, `alt`, `width`, `height`
- [ ] `acf` vuoto = `[]` (normale: il sito lo gestisce)

**Sicurezza e redirect**

- [ ] `curl -I "https://wp.cultivarolio.it/wp-json/wp/v2/pages" -H "Origin: https://evil.example"` → **nessun** `Access-Control-Allow-Origin`; con `-H "Origin: http://localhost:3000"` → presente, con `Vary: Origin`
- [ ] `curl -I -X OPTIONS "https://wp.cultivarolio.it/wp-json/wp/v2/pages" -H "Origin: http://localhost:3000"` → `204`
- [ ] `curl -I "https://wp.cultivarolio.it/wp-json/wp/v2/pages"` → `X-Robots-Tag: noindex, nofollow`, `X-Content-Type-Options: nosniff`, nessun `X-Pingback`
- [ ] `curl -I "https://wp.cultivarolio.it/"` (non collegato) → `301` verso `https://cultivarolio.it/`; `/wp-admin/`, `/wp-login.php`, `/wp-json/` **non** rediretti
- [ ] `curl -s -o /dev/null -w "%{http_code}" https://wp.cultivarolio.it/xmlrpc.php` → non risponde come XML-RPC

**Frontend**

- [ ] `curl -s -X POST https://cultivarolio.it/api/revalidate -H "X-WP-Revalidate-Token: …" -H "Content-Type: application/json" -d '{"post_type":"articolo","slug":"x"}'` → `{"ok":true,…}`; senza token → `401`
- [ ] Modifica un documentario in WordPress e salva: dopo pochi secondi `/documentari` mostra la modifica (log: `[cultivar] revalidate…` in `debug.log` solo se qualcosa va storto)
- [ ] Salva «Opzioni globali»: cambia un social, il footer si aggiorna ovunque
- [ ] Una bozza di articolo → «Vedi nel frontend» → si apre l'anteprima; `/api/preview/esci` la chiude
- [ ] Spegni WordPress (o sbaglia l'URL di WordPress): `next build` **non** si rompe e il sito mostra i testi di riserva
- [ ] Invio del modulo contatti: errori sui campi, poi email in arrivo; il campo nascosto `sito_web` compilato non invia nulla
- [ ] `/sitemap.xml` elenca gli articoli di WordPress (con `SITO_PUBBLICO=1`)
- [ ] Nessun refuso nuovo: confronta le pagine con l'anteprima approvata

## 13. Risoluzione problemi

- **I campi ACF non compaiono su una pagina**: lo slug non è quello esatto, oppure il Sync non è stato fatto. Salva la bozza e ricarica.
- **`acf` vuoto nella REST**: il gruppo non ha `show_in_rest` (rifai Sync) oppure la pagina non ha ancora lo slug giusto.
- **Il sito mostra i testi vecchi**: `NEXT_PUBLIC_WP_API_URL` mancante/errato, `CMS_PROVIDER=mock` in `.env.local`, oppure WordPress irraggiungibile (guarda i log `[wordpress]` del build).
- **Il revalidate non scatta**: controlla `NEXT_URL`, `WP_REVALIDATE_TOKEN` e che il valore su Vercel sia identico; gli errori sono in `wp-content/debug.log` (`WP_DEBUG_LOG`).
- **Le immagini non si vedono con `next/image`**: il dominio WordPress deve combaciare con `NEXT_PUBLIC_WP_API_URL` (lo ricava `next.config.ts`). Il sito oggi usa `<img>` semplici, quindi non serve.
