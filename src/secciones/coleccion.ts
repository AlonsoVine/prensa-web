// «Tu carpeta crece con la lista»: una mesa con tres piezas que cuentan la
// novedad de Prensa al ritmo del scroll.
//   1. La lista de YouTube crece: entran tres vídeos nuevos.
//   2. Prensa lo nota: la funda de la estantería recibe su pegatina roja.
//   3. Solo lo nuevo: se prensan los tres ficheros que faltan, la playlist se
//      pone al día y la funda se queda con el sello «Al día».
// Igual que «Cómo funciona», la escena es una función pura del avance (0..1).
import gsap from "gsap";
import { fijarConCss } from "../efectos/fijar";
import { t } from "../i18n";

const ANTES = 10;
const NUEVAS = 3;

export function montarColeccion(quieto: boolean): void {
  const seccion = document.querySelector<HTMLElement>(".coleccion");
  const fijo = seccion?.querySelector<HTMLElement>(".coleccion__fijo");
  const mesa = seccion?.querySelector<HTMLElement>(".mesa");
  if (!seccion || !fijo || !mesa) return;

  const $ = <T extends Element = HTMLElement>(sel: string): T | null => mesa.querySelector<T>(sel);
  const $$ = (sel: string): HTMLElement[] => [...mesa.querySelectorAll<HTMLElement>(sel)];

  const pasos = [...seccion.querySelectorAll<HTMLElement>(".paso")];
  const piezas = $$("[data-tramo]");
  const cuenta = $(".mesa__cuenta");
  const videosNuevos = $$(".video--nuevo");
  const funda = $(".mesa__funda");
  const tengo = $(".mesa__tengo");
  const pegatina = $(".mesa__pegatina");
  const nuevasCifra = $(".mesa__nuevas");
  const nuevasTexto = $(".mesa__nuevas-t");
  const sello = $(".mesa__sello");
  const ficheros = $$(".fichero--nuevo");
  const m3u = $(".fichero--m3u");

  const escribirMas = (): void => {
    for (const el of $$("[data-mas]"))
      el.textContent = `··· ${t("demo.mas", { n: el.dataset.mas ?? "" })}`;
  };

  const pintar = (p: number): void => {
    const tramo = Math.min(2, Math.floor(p * 3));
    pasos.forEach((paso, i) => {
      paso.classList.toggle("activo", i === tramo);
      paso.style.setProperty("--avance", String(gsap.utils.clamp(0, 1, p * 3 - i)));
    });
    piezas.forEach((pieza, i) => pieza.classList.toggle("enfocada", i === tramo));

    // 1 · Entran los vídeos nuevos, uno a uno, al final de la lista.
    const p1 = gsap.utils.clamp(0, 1, p * 3);
    let llegados = 0;
    videosNuevos.forEach((li, i) => {
      const v = gsap.utils.clamp(0, 1, (p1 - 0.12 - i * 0.24) * 4);
      if (v >= 0.5) llegados++;
      li.style.setProperty("--entra", v.toFixed(3));
    });
    if (cuenta) cuenta.textContent = t("demo.videos", { n: ANTES + llegados });

    // 2 · La funda se entera: aparece la pegatina y el medidor se queda corto.
    const p2 = gsap.utils.clamp(0, 1, p * 3 - 1);
    // 3 · Se prensan las nuevas, una tras otra; después, la playlist y el sello.
    const p3 = gsap.utils.clamp(0, 1, p * 3 - 2);
    let prensadas = 0;
    ficheros.forEach((li, i) => {
      const local = gsap.utils.clamp(0, 1, (p3 - i * 0.22) / 0.26);
      if (local >= 1) prensadas++;
      li.style.setProperty("--prensa", local.toFixed(3));
      li.classList.toggle("activo", local > 0 && local < 1);
      li.classList.toggle("hecho", local >= 1);
      const estado = li.querySelector<HTMLElement>(".fichero__estado");
      if (estado)
        estado.textContent =
          local <= 0 ? "" : local < 1 ? `${t("demo.prensando")} ${Math.round(local * 100)}%` : "✓";
    });

    const conocidas = p2 > 0.15 ? NUEVAS : 0;
    const total = ANTES + conocidas;
    const tiene = ANTES + prensadas;
    const faltan = conocidas - prensadas;
    if (tengo) tengo.textContent = t("demo.tengo", { a: tiene, b: total });
    funda?.style.setProperty("--prensado", (tiene / total).toFixed(3));
    funda?.classList.toggle("con-nuevas", faltan > 0);

    if (pegatina) {
      const estampa = gsap.utils.clamp(0, 1, (p2 - 0.15) * 3.5);
      const sale = faltan === 0 && conocidas > 0 ? 1 : 0;
      pegatina.style.setProperty("--estampa", (estampa * (1 - sale)).toFixed(3));
    }
    if (nuevasCifra && faltan > 0) nuevasCifra.textContent = `+${faltan}`;
    if (nuevasTexto && faltan > 0)
      nuevasTexto.textContent = t(faltan === 1 ? "demo.nueva" : "demo.nuevas");

    const final = gsap.utils.clamp(0, 1, (p3 - 0.78) * 6);
    m3u?.style.setProperty("--fin", final.toFixed(3));
    m3u?.classList.toggle("hecho", final >= 1);
    // El sello «Al día» está al principio (antes de que la lista crezca) y vuelve al final.
    const alDia = conocidas === 0 ? 1 : gsap.utils.clamp(0, 1, (p3 - 0.86) * 8);
    sello?.style.setProperty("--fin", alDia.toFixed(3));
  };

  const estado = { p: quieto ? 1 : 0 };
  escribirMas();
  pintar(estado.p);
  document.addEventListener("prensa:idioma", () => {
    escribirMas();
    pintar(estado.p);
  });
  if (quieto) return;

  const mm = gsap.matchMedia();
  // En móvil no se fija: la mesa se anima mientras cruza la pantalla.
  mm.add("(max-width: 860px)", () => {
    seccion.classList.add("sin-fijar");
    const tween = gsap.to(estado, {
      p: 1,
      ease: "none",
      onUpdate: () => pintar(estado.p),
      scrollTrigger: { trigger: mesa, start: "top 75%", end: "bottom 30%", scrub: 0.5 },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      seccion.classList.remove("sin-fijar");
    };
  });
  mm.add("(min-width: 861px)", () => {
    estado.p = 0;
    pintar(0);
    const soltar = fijarConCss(seccion, fijo, () => innerHeight * 1.7);
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
