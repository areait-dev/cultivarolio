import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@/components/Analytics";
import { ConsensoProvider } from "@/components/Consenso";
import { PiePagina } from "@/components/PiePagina";
import { Testata } from "@/components/Testata";
import { inCostruzione } from "@/lib/costruzione";
import { getSito } from "@/lib/dati-sito";
import { site } from "@/lib/site";
import { fontDisplay, fontSans } from "./fonts";
import "./globals.css";

// Il footer mostra l'anno corrente: le pagine statiche si rigenerano almeno una volta al giorno,
// così a Capodanno non resta l'anno della build. Le pagine con un tempo più breve lo tengono.
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const sito = await getSito();
  return {
    metadataBase: new URL(site.url),
    title: { default: sito.titoloCompleto, template: `%s · ${sito.nome}` },
    description: sito.descrizione,
    applicationName: sito.nome,
    openGraph: {
      type: "website",
      locale: site.locale,
      siteName: sito.nome,
      title: sito.titoloCompleto,
      description: sito.descrizione,
    },
    twitter: { card: "summary_large_image" },
    icons: { icon: "/icon.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: "#3b5436",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const sito = await getSito();
  return (
    <html lang="it" className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body>
        {!inCostruzione && (
          <a href="#contenuto" className="salta-al-contenuto">
            Vai al contenuto
          </a>
        )}
        {/* In costruzione: niente testata, piè di pagina e banner (il provider resta, le pagine lo richiedono al build) */}
        <ConsensoProvider senzaBanner={inCostruzione}>
          {!inCostruzione && <Testata navigazione={sito.navigazione} youtube={sito.social.youtube} />}
          <main id="contenuto" tabIndex={-1}>
            {children}
          </main>
          {!inCostruzione && <PiePagina />}
          {!inCostruzione && <Analytics />}
        </ConsensoProvider>
      </body>
    </html>
  );
}
