// Cabecera: se esconde al bajar y vuelve al subir, marca la sección en curso
// y una línea roja fina cuenta lo que queda de página.
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function montarCabecera(): void {
  const cabecera = document.querySelector<HTMLElement>(".cabecera");
  const progreso = cabecera?.querySelector<HTMLElement>(".cabecera__progreso");
  if (!cabecera || !progreso) return;

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate(st) {
      progreso.style.transform = `scaleX(${st.progress})`;
      const y = st.scroll();
      cabecera.classList.toggle("con-fondo", y > 40);
      // No se esconde mientras tiene el foco dentro (navegación con teclado).
      const enFoco = cabecera.contains(document.activeElement);
      cabecera.classList.toggle(
        "escondida",
        st.direction === 1 && y > innerHeight * 0.8 && !enFoco,
      );
    },
  });

  const enlaces = [...cabecera.querySelectorAll<HTMLAnchorElement>(".cabecera__nav a")];
  for (const enlace of enlaces) {
    const seccion = document.querySelector(enlace.hash);
    if (!seccion) continue;
    ScrollTrigger.create({
      trigger: seccion,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: (st) => {
        if (st.isActive) enlaces.forEach((e) => e.removeAttribute("aria-current"));
        if (st.isActive) enlace.setAttribute("aria-current", "true");
        else enlace.removeAttribute("aria-current");
      },
    });
  }
  cabecera.addEventListener("focusin", () => cabecera.classList.remove("escondida"));
}
