// Fijado con `position: sticky` en vez del `pin` de GSAP: la sección se alarga
// lo que dura el tramo y su interior se queda pegado arriba. El navegador no
// cambia nada de sitio al entrar o salir (el pin pasaba a `position: fixed` y
// medía como un salto de diseño de 1,0).
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function fijarConCss(
  seccion: HTMLElement,
  fijo: HTMLElement,
  recorrido: () => number,
): () => void {
  const medir = (): void => {
    fijo.style.height = `${innerHeight}px`;
    seccion.style.height = `${innerHeight + Math.max(0, recorrido())}px`;
  };
  seccion.classList.add("fijada-css");
  medir();
  ScrollTrigger.addEventListener("refreshInit", medir);
  return () => {
    ScrollTrigger.removeEventListener("refreshInit", medir);
    seccion.classList.remove("fijada-css");
    seccion.style.height = "";
    fijo.style.height = "";
  };
}
