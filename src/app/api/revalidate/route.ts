import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { percorsiDaRigenerare } from "@/lib/paths";
import { segretoValido } from "@/lib/segreti";

/**
 * Webhook chiamato dal mu-plugin di WordPress quando un contenuto cambia.
 * POST con header X-WP-Revalidate-Token e body { post_type, slug }.
 * Salvando la pagina "opzioni-globali" si rigenera l'intero layout (footer, social, recapiti).
 */
export async function POST(request: Request) {
  if (!segretoValido(request.headers.get("x-wp-revalidate-token"), process.env.WP_REVALIDATE_TOKEN)) {
    return NextResponse.json({ ok: false, errore: "non autorizzato" }, { status: 401 });
  }

  let corpo: { post_type?: unknown; slug?: unknown };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errore: "JSON non valido" }, { status: 400 });
  }
  const postType = typeof corpo.post_type === "string" ? corpo.post_type : "";
  const slug = typeof corpo.slug === "string" ? corpo.slug : "";
  if (!postType) return NextResponse.json({ ok: false, errore: "post_type mancante" }, { status: 400 });

  const percorsi = percorsiDaRigenerare(postType, slug);
  for (const { percorso, tipo } of percorsi) revalidatePath(percorso, tipo);

  return NextResponse.json({ ok: true, rigenerati: percorsi.map((p) => p.percorso) });
}
