// Entradas de texto ligadas al scroll. Se pueden rehacer al cambiar de idioma
// (los textos partidos se sustituyen enteros), por eso viven en un contexto de GSAP.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { partir, type Modo } from "../efectos/partir";

let contexto: gsap.Context | null = null;

export function montarTextos(quieto: boolean, primeraVez: boolean): void {
  contexto?.revert();
  contexto = gsap.context(() => {
    for (const el of document.querySelectorAll<HTMLElement>("[data-partir]")) {
      if (el.closest(".hero")) continue; // el hero tiene su propia entrada
      const modo = (el.dataset.partir || "palabras") as Modo;
      const piezas = partir(el, modo);
      if (quieto) continue;

      if (el.classList.contains("manifiesto__texto")) {
        // El manifiesto se «enciende» palabra a palabra al ritmo del scroll.
        gsap.to(piezas, {
          color: "#efe7d6",
          stagger: 0.12,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 42%", scrub: 0.6 },
        });
        continue;
      }
      gsap.from(piezas, {
        yPercent: 115,
        rotate: 4,
        duration: primeraVez ? 1.2 : 0.8,
        ease: "expo.out",
        stagger: 0.035,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    }
  });
}

export function montarRevelados(quieto: boolean): void {
  if (quieto) return;
  const elementos = gsap.utils.toArray<HTMLElement>("[data-revelar]");
  gsap.set(elementos, { y: 48, opacity: 0 });
  // Con teclado se puede llegar antes que el scroll: el foco nunca cae en algo invisible.
  document.addEventListener("focusin", (e) => {
    const bloque = (e.target as Element).closest<HTMLElement>("[data-revelar]");
    if (!bloque || Number(getComputedStyle(bloque).opacity) >= 1) return;
    gsap.killTweensOf(bloque);
    gsap.set(bloque, { y: 0, opacity: 1 });
  });
  // Los que entran a la vez se escalonan.
  ScrollTrigger.batch(elementos, {
    start: "top 90%",
    once: true,
    onEnter: (lote) =>
      gsap.to(lote, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.08 }),
  });
}
