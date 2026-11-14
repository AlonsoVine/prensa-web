import "./styles/fuentes.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/secciones.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { montarCinta, sincronizarCinta } from "./efectos/cinta";
import { montarCursor } from "./efectos/cursor";
import { ponerGrano } from "./efectos/grano";
import { montarMagneticos } from "./efectos/magnetico";
import { precarga } from "./efectos/precarga";
import { alCambiarIdioma, idioma, idiomaInicial, ponerIdioma } from "./i18n";
import { montarAutor } from "./secciones/autor";
import { montarCabecera } from "./secciones/cabecera";
import { montarCapturas } from "./secciones/capturas";
import { montarComo } from "./secciones/como";
import { montarDescarga } from "./secciones/descarga";
import { montarHero } from "./secciones/hero";
import { montarRevelados, montarTextos } from "./secciones/textos";

gsap.registerPlugin(ScrollTrigger);

const raiz = document.documentElement;
const quieto = raiz.classList.contains("quieto");

async function arrancar(): Promise<void> {
  ponerGrano();
  const inicial = idiomaInicial();
  if (inicial !== "es") ponerIdioma(inicial, false);
  else raiz.lang = "es";

  // Scroll suave con inercia. Con movimiento reducido, el del navegador.
  let lenis: Lenis | null = null;
  if (!quieto) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.2 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((tiempo) => lenis?.raf(tiempo * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const velocidad = (): number => lenis?.velocity ?? 0;

  // Anclas internas: con Lenis, el desplazamiento también es suave.
  document.addEventListener("click", (e) => {
    const enlace = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!enlace || !lenis) return;
    const destino =
      enlace.hash === "#arriba" ? 0 : document.querySelector<HTMLElement>(enlace.hash);
    if (destino === null) return;
    e.preventDefault();
    lenis.scrollTo(destino, { duration: 1.6 });
    if (destino !== 0) {
      destino.setAttribute("tabindex", "-1");
      destino.focus({ preventScroll: true });
    }
  });

  const hero = await montarHero(quieto, velocidad);
  montarCabecera();
  if (!quieto) {
    montarCinta(velocidad);
    montarCursor();
    montarMagneticos();
  }
  montarTextos(quieto, true);
  montarRevelados(quieto);
  montarComo(quieto);
  montarCapturas({
    quieto,
    pararScroll: (si) => (si ? lenis?.stop() : lenis?.start()),
  });
  montarDescarga(quieto);
  montarAutor(quieto);

  // Cambio de idioma.
  document.querySelector(".idioma")?.addEventListener("click", () => {
    ponerIdioma(idioma() === "es" ? "en" : "es");
  });
  alCambiarIdioma(() => {
    hero.repartir();
    sincronizarCinta();
    montarTextos(quieto, false);
    document.dispatchEvent(new Event("prensa:idioma"));
    ScrollTrigger.refresh();
  });

  await precarga(document.fonts.ready);
  lenis?.start();
  hero.entrar();
  ScrollTrigger.refresh();
}

void arrancar();
