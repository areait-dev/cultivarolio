import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Finché non è impostato SITO_PUBBLICO=1, ogni pagina risponde con la pagina "in costruzione".
// 503 + Retry-After dice ai motori di ricerca che è una chiusura temporanea.
const PREFISSI_API = ["/api/revalidate", "/api/preview", "/api/contatti"];

export function proxy(request: NextRequest) {
  if (process.env.SITO_PUBBLICO === "1") return NextResponse.next();
  const { pathname } = request.nextUrl;
  // lasciano passare la pagina stessa, gli asset di Next, i file statici (hanno un'estensione)
  // e le API usate da WordPress (revalidate, preview) e dal modulo contatti
  if (
    pathname === "/in-costruzione" ||
    pathname.startsWith("/_next/") ||
    PREFISSI_API.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    /\.[a-z0-9]+$/i.test(pathname)
  ) {
    return NextResponse.next();
  }
  return NextResponse.rewrite(new URL("/in-costruzione", request.url), {
    status: 503,
    headers: { "Retry-After": "86400" },
  });
}
