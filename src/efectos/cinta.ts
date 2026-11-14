// Cinta de rótulos que corre sin fin. La velocidad del scroll la acelera y
// cambia su sentido, como una cinta de bobina que se arrastra con la mano.
import gsap from "gsap";

export function montarCinta(velocidadScroll: () => number): void {
  const pista = document.querySelector<HTMLElement>(".cinta__pista");
  const grupo = pista?.querySelector<HTMLElement>(".cinta__grupo");
  if (!pista || !grupo) return;
  // Copias suficientes para cubrir pantallas anchas.
  for (let i = 0; i < 2; i++) {
    const copia = grupo.cloneNode(true) as HTMLElement;
    copia.querySelectorAll("[data-i18n]").forEach((n) => n.removeAttribute("data-i18n"));
    pista.append(copia);
  }
  // El ancho se mide solo cuando cambia (leerlo en cada fotograma forzaba un reflow).
  let ancho = grupo.offsetWidth;
  new ResizeObserver(() => (ancho = grupo.offsetWidth)).observe(grupo);
  let x = 0;
  let sentido = -1;
  const base = 60; // px/s
  gsap.ticker.add((_, dtMs) => {
    const dt = dtMs / 1000;
    const v = velocidadScroll();
    if (Math.abs(v) > 0.5) sentido = v > 0 ? -1 : 1;
    if (!ancho) return;
    x += sentido * (base + Math.min(Math.abs(v) * 40, 1600)) * dt;
    x = gsap.utils.wrap(-ancho, 0, x);
    pista.style.transform = `translate3d(${x}px,0,0)`;
  });
}

export function sincronizarCinta(): void {
  const pista = document.querySelector<HTMLElement>(".cinta__pista");
  const grupo = pista?.querySelector<HTMLElement>(".cinta__grupo");
  if (!pista || !grupo) return;
  const textos = [...grupo.children].map((li) => li.textContent);
  for (const copia of [...pista.children].slice(1)) {
    [...copia.children].forEach((li, i) => (li.textContent = textos[i] ?? ""));
  }
}
