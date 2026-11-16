import { getSito } from "@/lib/dati-sito";
import { IconaFacebook, IconaInstagram, IconaTikTok, IconaYouTube } from "./Icone";
import s from "./Social.module.css";

export async function Social() {
  const { social } = await getSito();
  const voci = [
    { nome: "YouTube", href: social.youtube, Icona: IconaYouTube },
    { nome: "Instagram", href: social.instagram, Icona: IconaInstagram },
    { nome: "Facebook", href: social.facebook, Icona: IconaFacebook },
    { nome: "TikTok", href: social.tiktok, Icona: IconaTikTok },
  ];
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
