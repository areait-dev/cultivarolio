import { Ruvido } from "./Ruvido";
import s from "./NotaBozza.module.css";

/** Avviso per i testi legali segnaposto: da togliere quando il legale li ha validati. */
export function NotaBozza() {
  return (
    <Ruvido forma="striscia" tono="lilla" riquadro role="note" className={s.nota}>
      <strong>Bozza da validare.</strong> Questo testo è un segnaposto: va rivisto e approvato dal legale prima della
      pubblicazione.
    </Ruvido>
  );
}
