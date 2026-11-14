// Precarga: una galleta lisa que se prensa de fuera hacia dentro mientras el
// contador llega a 100, y después se levanta como la tapa de la prensa.
import gsap from "gsap";

const SVG = "http://www.w3.org/2000/svg";

export function precarga(listo: Promise<unknown>): Promise<void> {
  const capa = document.querySelector<HTMLElement>(".precarga");
  if (!capa || getComputedStyle(capa).display === "none") return Promise.resolve();
  // En la misma sesión ya se ha visto: no se repite.
  let vista = false;
  try {
    vista = sessionStorage.getItem("prensa-web:precarga") === "1";
    sessionStorage.setItem("prensa-web:precarga", "1");
  } catch {
    /* almacenamiento bloqueado: se muestra */
  }
  if (vista) {
    capa.style.display = "none";
    return Promise.resolve();
  }
  const surcos = capa.querySelector("svg");
  const cifra = capa.querySelector<HTMLElement>(".precarga__cifra");
  const disco = capa.querySelector<HTMLElement>(".precarga__disco");
  const circulos: SVGCircleElement[] = [];
  for (let i = 0; i < 16; i++) {
    const c = document.createElementNS(SVG, "circle");
    c.setAttribute("cx", "100");
    c.setAttribute("cy", "100");
    c.setAttribute("r", String(96 - i * 3.6));
    c.style.opacity = "0";
    surcos?.append(c);
    circulos.push(c);
  }

  const estado = { p: 0 };
  return new Promise((resolver) => {
    const tl = gsap.timeline({ paused: true });
    tl.to(estado, {
      p: 100,
      duration: 0.75,
      ease: "power2.inOut",
      onUpdate() {
        if (cifra) cifra.textContent = String(Math.round(estado.p)).padStart(3, "0");
        const hechos = Math.floor((estado.p / 100) * circulos.length);
        circulos.forEach((c, i) => (c.style.opacity = i < hechos ? "1" : "0"));
      },
    })
      .to(disco, { scale: 0.92, duration: 0.12, ease: "power2.in" })
      .to(disco, { scale: 1, duration: 0.35, ease: "elastic.out(1.1, 0.4)" })
      .to(
        capa,
        {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.7,
          ease: "expo.inOut",
          onStart: () => resolver(),
        },
        "-=0.3",
      )
      .set(capa, { display: "none" });

    // El contador no termina hasta que las fuentes están listas (o pasa un tope).
    const tope = new Promise((r) => setTimeout(r, 1200));
    let preparado = false;
    Promise.race([listo, tope]).then(() => {
      preparado = true;
      if (tl.paused()) tl.play();
    });
    tl.call(() => void (preparado || tl.pause()), [], 0.6);
    tl.play();
  });
}
