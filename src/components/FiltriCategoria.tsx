import Link from "next/link";
import type { Categoria } from "@/lib/content/types";
import s from "./FiltriCategoria.module.css";

/**
 * Filtri del blog come link (?categoria=…): funzionano senza JavaScript,
 * sono indicizzabili e condivisibili.
 */
export function FiltriCategoria({ categorie, attiva }: { categorie: Categoria[]; attiva?: string }) {
  const voci = [{ slug: "", nome: "Tutti" }, ...categorie];
  return (
    <nav aria-label="Filtra per categoria">
      <ul className={s.filtri} role="list">
        {voci.map((c) => {
          const corrente = (attiva ?? "") === c.slug;
          return (
            <li key={c.slug || "tutti"}>
              <Link
                href={c.slug ? `/blog?categoria=${c.slug}` : "/blog"}
                className={s.filtro}
                aria-current={corrente ? "page" : undefined}
                scroll={false}
              >
                {c.nome}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
