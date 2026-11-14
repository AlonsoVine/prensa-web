// Galería de capturas: en escritorio la sección se fija y las capturas pasan en
// horizontal con el scroll; en móvil o con movimiento reducido es un carrusel
// nativo con imán. Un clic abre el visor a pantalla completa.
import gsap from "gsap";
import { CAPTURAS, fuentes } from "../content/capturas";
import { idioma, t } from "../i18n";
import type { Clave } from "../i18n/es";

interface Opciones {
  quieto: boolean;
  pararScroll(si: boolean): void;
}

export function montarCapturas({ quieto, pararScroll }: Opciones): void {
  const seccion = document.querySelector<HTMLElement>(".capturas");
  const fijo = seccion?.querySelector<HTMLElement>(".capturas__fijo");
  const pista = seccion?.querySelector<HTMLElement>(".capturas__pista");
  const barra = seccion?.querySelector<HTMLElement>(".capturas__barra span");
  const actual = seccion?.querySelector<HTMLElement>(".capturas__actual");
  if (!seccion || !fijo || !pista || !barra || !actual) return;
  const figuras = [...pista.querySelectorAll<HTMLElement>(".captura")];

  const marcar = (avance: number): void => {
    barra.style.transform = `scaleX(${avance})`;
    const i = Math.min(figuras.length - 1, Math.round(avance * (figuras.length - 1)));
    actual.textContent = String(i + 1).padStart(2, "0");
  };

  const mm = gsap.matchMedia();
  mm.add({ escritorio: "(min-width: 861px)", movil: "(max-width: 860px)" }, (ctx) => {
    const { escritorio } = ctx.conditions as { escritorio: boolean };
    if (escritorio && !quieto) {
      seccion.classList.remove("nativa");
      const distancia = (): number => pista.scrollWidth - innerWidth;
      const tween = gsap.to(pista, {
        x: () => -distancia(),
        ease: "none",
        scrollTrigger: {
          trigger: seccion,
          pin: fijo,
          start: "top top",
          // El recorrido vertical es menos de la mitad del horizontal: la galería
          // pasa en unas tres pantallas de scroll.
          end: () => `+=${distancia() * 0.42}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (st) => marcar(st.progress),
        },
      });
      // La pista se mueve con transform: el navegador no sabe llevar el foco a una
      // captura que está fuera de la pantalla. Se hace a mano, con el scroll.
      const alEnfocar = (e: FocusEvent): void => {
        const fig = (e.target as Element).closest<HTMLElement>(".captura");
        const st = tween.scrollTrigger;
        if (!fig || !st) return;
        const i = figuras.indexOf(fig);
        if (i < 0) return;
        const destino = st.start + ((st.end - st.start) * i) / Math.max(1, figuras.length - 1);
        window.scrollTo({ top: destino, behavior: "instant" });
      };
      pista.addEventListener("focusin", alEnfocar);
      return () => pista.removeEventListener("focusin", alEnfocar);
    } else {
      seccion.classList.add("nativa");
      const alDeslizar = (): void => {
        const max = pista.scrollWidth - pista.clientWidth;
        marcar(max > 0 ? pista.scrollLeft / max : 0);
      };
      pista.addEventListener("scroll", alDeslizar, { passive: true });
      return () => pista.removeEventListener("scroll", alDeslizar);
    }
    return undefined;
  });

  // Cursor con palabra sobre las capturas.
  const rotularCursor = (): void => {
    for (const marco of seccion.querySelectorAll<HTMLElement>(".captura__marco")) {
      marco.dataset.cursor = t("capturas.ampliar");
    }
  };
  rotularCursor();

  // Al cambiar de idioma: las capturas con variante inglesa cambian de imagen.
  document.addEventListener("prensa:idioma", () => {
    rotularCursor();
    for (const img of pista.querySelectorAll<HTMLImageElement>("img[data-captura]")) {
      const c = CAPTURAS.find((x) => x.id === img.dataset.captura);
      if (!c?.en) continue;
      const { src, srcset } = fuentes(c, idioma());
      img.srcset = srcset;
      img.src = src;
    }
  });

  montarVisor(figuras, pararScroll);
}

function montarVisor(figuras: HTMLElement[], pararScroll: (si: boolean) => void): void {
  const visor = document.querySelector<HTMLDialogElement>(".visor");
  const img = visor?.querySelector<HTMLImageElement>(".visor__img");
  const n = visor?.querySelector<HTMLElement>(".visor__n");
  const titulo = visor?.querySelector<HTMLElement>(".visor__t");
  const desc = visor?.querySelector<HTMLElement>(".visor__d");
  if (!visor || !img || !n || !titulo || !desc) return;
  let indice = 0;
  let origen: HTMLElement | null = null;

  const mostrar = (i: number): void => {
    indice = (i + CAPTURAS.length) % CAPTURAS.length;
    const c = CAPTURAS[indice];
    if (!c) return;
    const { src } = fuentes(c, idioma());
    img.src = src;
    img.alt = t(`cap.${c.id}.t` as Clave);
    n.textContent = `${String(indice + 1).padStart(2, "0")} / ${String(CAPTURAS.length).padStart(2, "0")}`;
    titulo.textContent = t(`cap.${c.id}.t` as Clave);
    desc.textContent = t(`cap.${c.id}.d` as Clave);
  };

  figuras.forEach((fig, i) => {
    const marco = fig.querySelector<HTMLElement>(".captura__marco");
    marco?.addEventListener("click", () => {
      origen = marco;
      mostrar(i);
      visor.showModal();
      pararScroll(true);
    });
  });

  visor.addEventListener("click", (e) => {
    const accion = (e.target as HTMLElement).closest<HTMLElement>("[data-visor]")?.dataset.visor;
    if (accion === "anterior") mostrar(indice - 1);
    else if (accion === "siguiente") mostrar(indice + 1);
    else if (accion === "cerrar" || e.target === visor) visor.close();
  });
  visor.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") mostrar(indice - 1);
    if (e.key === "ArrowRight") mostrar(indice + 1);
  });
  visor.addEventListener("close", () => {
    pararScroll(false);
    origen?.focus();
  });
}
