// Pie: el anillo de catálogo gira con el scroll, como la última vuelta del surco.
import gsap from "gsap";

export function montarPie(quieto: boolean): void {
  const anillo = document.querySelector<SVGSVGElement>(".pie__surco svg");
  if (!anillo || quieto) return;
  gsap.fromTo(
    anillo,
    { rotate: -40 },
    {
      rotate: 40,
      ease: "none",
      transformOrigin: "50% 50%",
      scrollTrigger: { trigger: ".pie", start: "top bottom", end: "bottom bottom", scrub: true },
    },
  );
}
