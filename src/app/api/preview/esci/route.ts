import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/** Esce dall'anteprima e torna alla home. */
export async function GET() {
  (await draftMode()).disable();
  redirect("/");
}
