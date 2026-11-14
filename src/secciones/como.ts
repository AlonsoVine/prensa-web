// «Cómo funciona»: la app en miniatura recorre sus tres pasos al ritmo del scroll.
// La sección queda fijada y una línea de tiempo de GSAP se arrastra con la rueda.
import gsap from "gsap";
import { fijarConCss } from "../efectos/fijar";
import { t } from "../i18n";
import { escena as compartido } from "./estado";

const SVG = "http://www.w3.org/2000/svg";
const URL_DEMO = "youtube.com/playlist?list=PLgrabacionesDeCampo";
const N_SURCOS = 22;

function el<K extends keyof SVGElementTagNameMap>(
  nombre: K,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const nodo = document.createElementNS(SVG, nombre);
  for (const [k, v] of Object.entries(attrs)) nodo.setAttribute(k, String(v));
  return nodo;
}

function construirDisco(svg: SVGSVGElement): { surcos: SVGCircleElement[]; cifra: SVGTextElement } {
  svg.append(el("circle", { cx: 100, cy: 100, r: 98, class: "plato" }));
  const surcos: SVGCircleElement[] = [];
  for (let i = 0; i < N_SURCOS; i++) {
    const c = el("circle", { cx: 100, cy: 100, r: 94 - i * 2.6, class: "surco" });
    svg.append(c);
    surcos.push(c);
  }
  svg.append(el("circle", { cx: 100, cy: 100, r: 34, class: "etiqueta" }));
  const cifra = el("text", { x: 100, y: 100, class: "cifra" });
  cifra.textContent = "";
  svg.append(cifra);
  return { surcos, cifra };
}

// Onda decorativa por pista, como en la app: determinista a partir del índice.
function construirOnda(caja: HTMLElement, semilla: number): void {
  const barras = 34;
  const svg = el("svg", { viewBox: `0 0 ${barras * 4} 20`, preserveAspectRatio: "none" });
  svg.style.width = "100%";
  svg.style.height = "100%";
  let s = semilla * 9301 + 49297;
  for (let i = 0; i < barras; i++) {
    s = (s * 9301 + 49297) % 233280;
    const alto = 4 + (s / 233280) * 15 * (0.55 + 0.45 * Math.sin(i * 0.45 + semilla));
    svg.append(
      el("rect", { x: i * 4, y: (20 - alto) / 2, width: 1.6, height: alto, fill: "currentColor" }),
    );
  }
  caja.append(svg);
}

export function montarComo(quieto: boolean): void {
  const seccion = document.querySelector<HTMLElement>(".como");
  const fijo = seccion?.querySelector<HTMLElement>(".como__fijo");
  const escena = seccion?.querySelector<HTMLElement>(".escena");
  const disco = escena?.querySelector<SVGSVGElement>(".escena__disco");
  if (!seccion || !fijo || !escena || !disco) return;

  const { surcos, cifra } = construirDisco(disco);
  const pistas = [...escena.querySelectorAll<HTMLElement>(".escena__pistas li")];
  pistas.forEach((li, i) => {
    const onda = li.querySelector<HTMLElement>(".onda");
    if (onda) construirOnda(onda, i + 3);
  });
  const pasos = [...seccion.querySelectorAll<HTMLElement>(".paso")];
  const migas = [...escena.querySelectorAll<HTMLElement>(".escena__miga")];
  const tecleo = escena.querySelector<HTMLElement>(".escena__tecleo");
  const leer = escena.querySelector<HTMLElement>(".escena__leer");
  const cabeza = escena.querySelector<HTMLElement>(".escena__cabeza");
  const vumetro = escena.querySelector<HTMLElement>(".escena__vumetro");
  const aguja = escena.querySelector<SVGLineElement>(".vu__aguja");
  const sello = escena.querySelector<HTMLElement>(".escena__sello");

  // La aguja del vúmetro baila con el tiempo (la música no depende del scroll).
  let sonando = false;
  if (aguja && !quieto) {
    gsap.ticker.add((tiempo) => {
      if (!sonando) return;
      const vaiven =
        Math.sin(tiempo * 7.3) * 7 + Math.sin(tiempo * 17.9) * 4 + Math.sin(tiempo * 2.1) * 5;
      aguja.style.transform = `rotate(${18 + vaiven}deg)`;
    });
  }

  // Estado de la escena en función del avance global (0..1). Es una función
  // pura del avance: se puede arrastrar adelante y atrás sin acumular nada.
  const pintar = (p: number): void => {
    const tramo = Math.min(2, Math.floor(p * 3));
    pasos.forEach((paso, i) => {
      paso.classList.toggle("activo", i === tramo);
      paso.style.setProperty("--avance", String(gsap.utils.clamp(0, 1, p * 3 - i)));
    });
    migas.forEach((m, i) => m.classList.toggle("activa", i === tramo));

    // Paso 1: teclear la URL.
    const p1 = gsap.utils.clamp(0, 1, (p * 3) / 0.8);
    if (tecleo) tecleo.textContent = URL_DEMO.slice(0, Math.round(URL_DEMO.length * p1));
    leer?.classList.toggle("pulsado", p * 3 > 0.85);

    // Paso 2: aparecen la lista y las pistas, escalonadas.
    const p2 = gsap.utils.clamp(0, 1, p * 3 - 1);
    if (cabeza) {
      cabeza.style.opacity = String(gsap.utils.clamp(0, 1, p2 * 4));
    }
    pistas.forEach((li, i) => {
      const v = gsap.utils.clamp(0, 1, (p2 - i * 0.12) * 3.5);
      li.style.opacity = String(v);
      li.style.transform = `translateY(${(1 - v) * -14}px)`;
    });

    // Paso 3: prensado pista a pista, surcos de fuera hacia dentro y sello.
    const p3 = gsap.utils.clamp(0, 1, p * 3 - 2);
    const avancePistas = p3 * pistas.length * 1.12;
    pistas.forEach((li, i) => {
      const local = avancePistas - i;
      const hecha = local >= 1;
      const activa = local > 0 && !hecha;
      li.classList.toggle("activa", activa);
      li.classList.toggle("hecha", hecha);
      const estado = li.querySelector<HTMLElement>(".estado");
      if (estado) {
        estado.textContent =
          p3 <= 0
            ? ""
            : hecha
              ? t("escena.hecha")
              : activa
                ? `${Math.round(local * 100)}%`
                : t("escena.cola");
      }
    });
    const total = gsap.utils.clamp(0, 1, p3 * 1.12);
    compartido.prensado = total;
    const n = Math.round(total * surcos.length);
    surcos.forEach((s, i) => {
      s.style.opacity = i < n ? "1" : "0";
      s.classList.toggle("rojo", i === n - 1 && total < 1);
    });
    cifra.textContent = p3 > 0 ? `${Math.round(total * 100)}%` : "";
    if (vumetro)
      vumetro.style.opacity = String(gsap.utils.clamp(0, 1, p3 * 8) * (total < 1 ? 1 : 0.35));
    sonando = total > 0 && total < 1;
    if (aguja && (!sonando || quieto)) aguja.style.transform = `rotate(${sonando ? 18 : -55}deg)`;
    if (sello) {
      const s = gsap.utils.clamp(0, 1, (p3 - 0.9) * 10);
      sello.style.opacity = String(s);
      sello.style.transform = `scale(${1.8 - 0.8 * s})`;
    }
  };

  const estado = { p: quieto ? 1 : 0 };
  pintar(estado.p);
  // Al cambiar de idioma, los estados de las pistas se vuelven a escribir.
  document.addEventListener("prensa:idioma", () => pintar(estado.p));
  if (quieto) return;

  // En móvil no se fija: la escena se ve acabada y los tres pasos, enteros.
  // En escritorio, el tramo fijado dura algo menos de tres pantallas.
  const mm = gsap.matchMedia();
  mm.add("(max-width: 860px)", () => {
    seccion.classList.add("sin-fijar");
    estado.p = 1;
    pintar(1);
    return () => seccion.classList.remove("sin-fijar");
  });
  mm.add("(min-width: 861px)", () => {
    estado.p = 0;
    pintar(0);
    const soltar = fijarConCss(seccion, fijo, () => innerHeight * 2.2);
    gsap.to(estado, {
      p: 1,
      ease: "none",
      onUpdate: () => pintar(estado.p),
      scrollTrigger: {
        trigger: seccion,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });
    return soltar;
  });
}
