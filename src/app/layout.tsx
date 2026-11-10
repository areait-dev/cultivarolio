import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ConsensoProvider } from "@/components/Consenso";
import { PiePagina } from "@/components/PiePagina";
import { Testata } from "@/components/Testata";
import { site } from "@/lib/site";
import { fontDisplay, fontSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.titoloCompleto, template: `%s · ${site.nome}` },
  description: site.descrizione,
  applicationName: site.nome,
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.nome,
    title: site.titoloCompleto,
    description: site.descrizione,
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#3b5436",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it" className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body>
        <a href="#contenuto" className="salta-al-contenuto">
          Vai al contenuto
        </a>
        <ConsensoProvider>
          <Testata />
          <main id="contenuto" tabIndex={-1}>
            {children}
          </main>
          <PiePagina />
        </ConsensoProvider>
      </body>
    </html>
  );
}
