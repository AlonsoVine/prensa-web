// Botones magnéticos: se dejan atraer un poco por el cursor y vuelven con un rebote.
import gsap from "gsap";

export function montarMagneticos(): void {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  for (const el of document.querySelectorAll<HTMLElement>("[data-magnetico]")) {
    const fuerza = 0.28;
    const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
    el.addEventListener("pointermove", (e) => {
      const caja = el.getBoundingClientRect();
      x((e.clientX - caja.left - caja.width / 2) * fuerza);
      y((e.clientY - caja.top - caja.height / 2) * fuerza);
    });
    el.addEventListener("pointerleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.35)" });
    });
  }
}
