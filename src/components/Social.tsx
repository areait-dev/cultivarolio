import { site } from "@/lib/site";
import { IconaFacebook, IconaInstagram, IconaTikTok, IconaYouTube } from "./Icone";
import s from "./Social.module.css";

const voci = [
  { nome: "YouTube", href: site.social.youtube, Icona: IconaYouTube },
  { nome: "Instagram", href: site.social.instagram, Icona: IconaInstagram },
  { nome: "Facebook", href: site.social.facebook, Icona: IconaFacebook },
  { nome: "TikTok", href: site.social.tiktok, Icona: IconaTikTok },
];

export function Social() {
  return (
    <ul className={s.social} role="list">
      {voci.map(({ nome, href, Icona }) => (
        <li key={nome}>
          <a href={href} target="_blank" rel="noopener noreferrer" className={s.voce}>
            <Icona width={20} height={20} />
            <span className="sr-only">Cultivar su {nome} (si apre in una nuova scheda)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
