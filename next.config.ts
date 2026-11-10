import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

/**
 * Senza un URL pubblico valido canonical, sitemap e Open Graph finirebbero su localhost.
 * Meglio fermare la build che pubblicare un sito con i link sbagliati.
 */
function verificaUrlPubblico() {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  const errore = (motivo: string) =>
    new Error(`NEXT_PUBLIC_SITE_URL ${motivo}. Impostalo con l'indirizzo pubblico del sito (vedi .env.example).`);
  if (!url) throw errore("non è impostato");
  let host: string;
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "https:" && protocol !== "http:") throw new Error();
    host = hostname;
  } catch {
    throw errore(`non è un indirizzo valido ("${url}")`);
  }
  if (host === "localhost" || host === "127.0.0.1") throw errore(`punta a ${host}`);
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Aggiungi qui il dominio delle immagini del CMS scelto (es. cdn.sanity.io).
    // Non aggiungere i.ytimg.com: le copertine dei video si servono dal sito (nessuna richiesta a YouTube prima del click).
    remotePatterns: [],
  },
  // I filtri del blog sono link ?categoria=… ma si servono da pagine statiche (ISR):
  // /blog?categoria=filiera → /blog/categoria/filiera (l'URL nel browser non cambia).
  async rewrites() {
    return {
      // beforeFiles: senza, la pagina statica /blog avrebbe la precedenza sulla riscrittura
      beforeFiles: [
        {
          source: "/blog",
          has: [{ type: "query", key: "categoria", value: "(?<categoria>[a-z0-9-]+)" }],
          destination: "/blog/categoria/:categoria",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: "/(forme|illustrazioni|logo)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default function config(fase: string): NextConfig {
  if (fase === PHASE_PRODUCTION_BUILD) verificaUrlPubblico();
  return nextConfig;
}
