// «¿Por qué una app?»: al entrar cada fila, la columna de la web se tacha.
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function montarPorque(quieto: boolean): void {
  if (quieto) return;
  for (const fila of document.querySelectorAll<HTMLElement>(".porque__tabla tbody tr")) {
    ScrollTrigger.create({
      trigger: fila,
      start: "top 72%",
      once: true,
      onEnter: () => fila.classList.add("tachada"),
    });
  }
}
