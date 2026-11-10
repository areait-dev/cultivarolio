import localFont from "next/font/local";

/**
 * Testo: Poppins (SIL OFL), self-hosted: nessuna richiesta a Google Fonts,
 * quindi nessun trasferimento di IP a terzi (rilevante per il GDPR).
 */
export const fontSans = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    { path: "./fonts/poppins-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/poppins-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});

/**
 * Display: carattere del marchio (BD Plakatt), esteso con punteggiatura e lettere accentate.
 * Il file originale ha solo A-Z, a-z e 0-9: i segni mancanti sono disegnati da scripts/estendi-font.py
 * (soluzione ponte, da far rifinire al type designer). Controlla la licenza prima della pubblicazione.
 *
 * Per rigenerare o sostituire il font:
 *   python scripts/estendi-font.py "percorso/bdplakatt.ttf" src/app/fonts/bd-plakatt-cultivar.woff2
 * I caratteri non presenti (es. "&", "%", "@") passano al carattere di sistema.
 */
export const fontDisplay = localFont({
  variable: "--font-display",
  display: "swap",
  src: [{ path: "./fonts/bd-plakatt-cultivar.woff2", weight: "400", style: "normal" }],
  fallback: ["system-ui", "Arial Rounded MT Bold", "sans-serif"],
});
