import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Con SITO_IN_COSTRUZIONE=1 ogni pagina risponde con la pagina "in costruzione".
// 503 + Retry-After dice ai motori di ricerca che è una chiusura temporanea.
export function proxy(request: NextRequest) {
  if (process.env.SITO_IN_COSTRUZIONE !== "1") return NextResponse.next();
  const { pathname } = request.nextUrl;
  // lasciano passare la pagina stessa, gli asset di Next e i file statici (hanno un'estensione)
  if (pathname === "/in-costruzione" || pathname.startsWith("/_next/") || /\.[a-z0-9]+$/i.test(pathname)) {
    return NextResponse.next();
  }
  return NextResponse.rewrite(new URL("/in-costruzione", request.url), {
    status: 503,
    headers: { "Retry-After": "86400" },
  });
}
