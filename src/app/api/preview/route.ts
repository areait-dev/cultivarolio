import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { percorsoAnteprima } from "@/lib/paths";
import { segretoValido } from "@/lib/segreti";

/**
 * Anteprima delle bozze: /api/preview?secret=…&slug=…&post_type=articolo|documentario|page
 * Attiva draftMode e porta alla pagina; da lì le letture da WordPress usano status=any
 * e l'Application Password (WP_PREVIEW_USER / WP_PREVIEW_APP_PASSWORD, solo lato server).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (!segretoValido(searchParams.get("secret"), process.env.WP_PREVIEW_SECRET)) {
    return NextResponse.json({ ok: false, errore: "non autorizzato" }, { status: 401 });
  }
  const percorso = percorsoAnteprima(searchParams.get("post_type") ?? "page", searchParams.get("slug") ?? "");
  if (!percorso) return NextResponse.json({ ok: false, errore: "contenuto non trovato" }, { status: 404 });

  (await draftMode()).enable();
  redirect(percorso);
}
