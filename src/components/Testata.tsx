"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { Pulsante } from "./Pulsante";
import s from "./Testata.module.css";

function attiva(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Testata() {
  const pathname = usePathname();
  const [aperto, setAperto] = useState(false);
  const bottone = useRef<HTMLButtonElement>(null);

  // chiude il menu al cambio pagina
  useEffect(() => setAperto(false), [pathname]);

  // Esc chiude il menu e riporta il focus sul bottone
  useEffect(() => {
    if (!aperto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAperto(false);
        bottone.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [aperto]);

  return (
    <header className={`${s.testata} superficie-verde carta`}>
      <nav className={s.nav} aria-label="Principale">
        <Link href="/" className={s.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/cultivar-bone.svg" alt="Cultivar – home" width={160} height={40} />
        </Link>

        <button
          ref={bottone}
          type="button"
          className={s.burger}
          aria-expanded={aperto}
          aria-controls="menu-principale"
          onClick={() => setAperto((v) => !v)}
        >
          <span className="sr-only">{aperto ? "Chiudi il menu" : "Apri il menu"}</span>
          <span className={s.linee} aria-hidden="true" />
        </button>

        <ul id="menu-principale" className={`${s.menu} ${aperto ? s.aperto : ""}`} role="list">
          {site.navigazione.map((v) => (
            <li key={v.href}>
              <Link href={v.href} aria-current={attiva(pathname, v.href) ? "page" : undefined} className={s.voce}>
                {v.etichetta}
              </Link>
            </li>
          ))}
          <li className={s.ctaMobile}>
            <Pulsante href={site.social.youtube} variante="chiaro" dimensione="piccolo">
              Iscriviti al canale
            </Pulsante>
          </li>
        </ul>

        <Pulsante href={site.social.youtube} variante="chiaro" dimensione="piccolo" className={s.cta}>
          Iscriviti al canale
        </Pulsante>
      </nav>
    </header>
  );
}
