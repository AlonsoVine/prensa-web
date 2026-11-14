// Cursor propio: un punto rojo y un aro que lo sigue con retraso. Crece sobre
// lo que se puede pulsar y muestra una palabra sobre lo que tiene `data-cursor`.

import gsap from "gsap";

export function montarCursor(): void {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const cursor = document.querySelector<HTMLElement>(".cursor");
  const punto = cursor?.querySelector<HTMLElement>(".cursor__punto");
  const aro = cursor?.querySelector<HTMLElement>(".cursor__aro");
  const texto = cursor?.querySelector<HTMLElement>(".cursor__texto");
  if (!cursor || !punto || !aro || !texto) return;

  document.documentElement.classList.add("cursor-propio");
  gsap.set([punto, aro], { x: -100, y: -100 });
  const px = gsap.quickTo(punto, "x", { duration: 0.08, ease: "power3" });
  const py = gsap.quickTo(punto, "y", { duration: 0.08, ease: "power3" });
  const ax = gsap.quickTo(aro, "x", { duration: 0.45, ease: "power3" });
  const ay = gsap.quickTo(aro, "y", { duration: 0.45, ease: "power3" });

  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      px(e.clientX);
      py(e.clientY);
      ax(e.clientX);
      ay(e.clientY);
    },
    { passive: true },
  );

  document.addEventListener("pointerover", (e) => {
    const destino = (e.target as Element).closest<HTMLElement>("a, button, [data-cursor]");
    const etiqueta = destino?.dataset.cursor;
    cursor.classList.toggle("sobre", !!destino && !etiqueta);
    cursor.classList.toggle("con-texto", !!etiqueta);
    if (etiqueta) texto.textContent = etiqueta;
  });
  document.addEventListener("pointerleave", () => gsap.to(cursor, { opacity: 0, duration: 0.2 }));
  document.addEventListener("pointerenter", () => gsap.to(cursor, { opacity: 1, duration: 0.2 }));
}
