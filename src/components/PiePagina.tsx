import Link from "next/link";
import { site } from "@/lib/site";
import { RiapriConsenso } from "./Consenso";
import { Social } from "./Social";
import s from "./PiePagina.module.css";

export function PiePagina() {
  const { titolare, cofinanziamento } = site;
  const anno = new Date().getFullYear();
  return (
    <footer className={`${s.footer} superficie-carbone carta`}>
      <div className="contenitore">
        <div className={s.alto}>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={s.logo} src="/logo/cultivar-bone.svg" alt="Cultivar" width={192} height={48} loading="lazy" />
            <p className={s.descrizione}>
              {site.titoloCompleto}.
              <br />
              Un progetto di {titolare.ragioneSociale}
              <br />
              P.IVA {titolare.piva}
            </p>
            <Social />
          </div>

          <div className={s.ente}>
            {cofinanziamento.logoRegione ? (
              // Il logo è a colori con scritta scura: sta su una targa chiara per restare leggibile sul fondo del footer
              <span className={s.targa}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cofinanziamento.logoRegione}
                  alt="Regione Siciliana"
                  className={s.logoEnte}
                  width={140}
                  height={67}
                  loading="lazy"
                />
              </span>
            ) : (
              <div className={s.slot} role="img" aria-label="Logo Regione Siciliana da inserire">
                logo Regione Siciliana
              </div>
            )}
            <p>
              {cofinanziamento.testo}
              <br />
              <strong>CUP: {cofinanziamento.cup ?? "[da inserire]"}</strong>
            </p>
          </div>
        </div>

        <div className={s.basso}>
          <span>
            © {anno} {titolare.ragioneSociale}
          </span>
          <nav aria-label="Note legali" className={s.legali}>
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/cookie">Cookie policy</Link>
            <RiapriConsenso />
          </nav>
        </div>
      </div>
    </footer>
  );
}
