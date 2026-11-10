import type { NextConfig } from "next";

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

export default nextConfig;
