/** Dati strutturati schema.org. Il "<" è escluso per evitare di chiudere il tag script dal contenuto. */
export function JsonLd({ dati }: { dati: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dati).replace(/</g, "\\u003c") }}
    />
  );
}
