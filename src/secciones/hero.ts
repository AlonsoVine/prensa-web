// Hero y disco global.
//
// Un solo vinilo WebGL acompaña la página: nace grande en el hero (se prensa de
// fuera hacia dentro al entrar), se aparta a la derecha del manifiesto, vuela al
// plato de la app en miniatura de «Cómo funciona» y se prensa allí al ritmo del
// scroll; después se apaga y vuelve al final, detrás de «Tu música, prensada».
// Su posición es una función pura del scroll: se puede ir y volver sin acumular.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { partir } from "../efectos/partir";
import { montarVinilo, type Vinilo } from "../gl/vinilo";
import { escena as compartido } from "./estado";

export interface Hero {
  entrar(): void;
  repartir(): void;
}

interface Pose {
  x: number; // centro, px
  y: number;
  d: number; // diámetro, px
  o: number; // opacidad
}

const mezclar = (a: Pose, b: Pose, t: number): Pose => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  d: a.d + (b.d - a.d) * t,
  o: a.o + (b.o - a.o) * t,
});

const suave = (t: number): number => t * t * (3 - 2 * t);

const esMovil = (): boolean => innerWidth <= 860;

/** Pose de un elemento en pantalla (el disco ocupa su caja). */
function poseDe(el: Element | null, o = 1): Pose | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!r.width) return null;
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, d: r.width, o };
}

function poses(): { hero: Pose; lado: Pose; fuera: Pose; abajo: Pose; final: Pose } {
  const w = innerWidth;
  const h = innerHeight;
  const movil = esMovil();
  // El disco del final va con su sección: así el pie no lo corta al llegar.
  const final = document.querySelector(".final")?.getBoundingClientRect();
  // La etiqueta roja queda bajo el botón (hueso), no bajo el titular rojo.
  const boton = document.querySelector(".final .boton")?.getBoundingClientRect();
  const yFinal = boton
    ? boton.top + boton.height / 2
    : final
      ? final.top + final.height / 2
      : h * 0.5;
  const dTope = final ? final.height * 0.92 : Infinity;
  if (movil) {
    const d = w * 1.1;
    const hero = { x: w * 0.85, y: h * 0.84, d, o: 1 };
    return {
      hero,
      lado: { ...hero, y: h * 0.5, d: d * 0.8, o: 0.0 },
      fuera: { ...hero, y: -d, o: 0 },
      abajo: { x: w * 0.5, y: yFinal + h * 0.8, d: w * 0.7, o: 0 },
      final: { x: w * 0.5, y: yFinal, d: Math.min(w * 1.05, dTope), o: 0.9 },
    };
  }
  const d = Math.min(h * 1.18, w * 0.92);
  const hero = { x: w + Math.min(h * 0.26, w * 0.2) - d / 2, y: h * 0.5 - d * 0.04, d, o: 1 };
  const dLado = Math.min(h * 0.68, w * 0.4);
  const lado = { x: w - dLado * 0.42, y: h * 0.52, d: dLado, o: 1 };
  return {
    hero,
    lado,
    fuera: { ...lado, x: w + dLado * 0.6, y: h * 0.35, d: dLado * 0.85, o: 1 },
    abajo: { x: w * 0.5, y: yFinal + h * 0.75, d: Math.min(h * 0.95, w * 0.7, dTope) * 0.8, o: 1 },
    final: (() => {
      const d = Math.min(h * 0.95, w * 0.7, dTope);
      return { x: w * 0.5, y: yFinal + d * 0.3, d, o: 1 };
    })(),
  };
}

export async function montarHero(quieto: boolean, velocidad: () => number): Promise<Hero> {
  const hero = document.querySelector<HTMLElement>(".hero");
  const capa = document.querySelector<HTMLElement>(".disco-fijo");
  const marco = document.querySelector<HTMLElement>(".disco-marco");
  const platoEscena = document.querySelector(".escena__disco");
  const giro = capa?.querySelector<HTMLElement>(".disco-fijo__giro");
  const lienzo = capa?.querySelector<HTMLCanvasElement>(".vinilo");
  const titulo = hero?.querySelector<HTMLElement>(".hero__titulo > span");
  const lema = hero?.querySelector<HTMLElement>(".hero__lema");
  if (!hero || !capa || !giro || !lienzo || !titulo || !lema) {
    return { entrar() {}, repartir() {} };
  }

  const letras = partir(titulo, "letras");
  let palabras = partir(lema);
  const resto = hero.querySelectorAll(
    ".hero__rotulo, .hero__sub, .hero__acciones, .hero__meta, .hero__datos, .hero__aguja",
  );

  // El lienzo tiene el tamaño del disco en el hero; el resto de poses se
  // consiguen escalando la capa (redimensionar el WebGL en cada fotograma sería caro).
  let base = poses().hero.d;
  const colocar = (pose: Pose): void => {
    const escala = pose.d / base;
    capa.style.width = `${base}px`;
    capa.style.height = `${base}px`;
    capa.style.opacity = String(pose.o);
    capa.style.transform = `translate3d(${pose.x - base / 2}px, ${pose.y - base / 2}px, 0) scale(${escala})`;
  };
  colocar(poses().hero);

  let vinilo: Vinilo | null = null;
  try {
    vinilo = await montarVinilo(lienzo, quieto);
  } catch {
    vinilo = null;
  }
  if (vinilo) document.documentElement.classList.add("con-gl");

  if (quieto) {
    // Sin movimiento: el disco se queda en el hero, pintado una vez.
    addEventListener("resize", () => {
      base = poses().hero.d;
      colocar(poses().hero);
      vinilo?.pintar(0);
    });
    return { entrar() {}, repartir: () => void partir(lema) };
  }

  gsap.set(letras, { yPercent: 105 });
  gsap.set(palabras, { yPercent: 115 });
  gsap.set(resto, { opacity: 0, y: 24 });
  gsap.set(giro, { opacity: 0, scale: 0.86, rotate: -25, transformPerspective: 1400 });

  // ── Recorrido del disco por la página ──
  // a: hero → lado · b: lado → fuera (móvil) · v: lado → plato de la escena
  // d: prensado en la escena (fijada) · e: se apaga al salir · c: final.
  const avance = { a: 0, b: 0, v: 0, d: 0, e: 0, c: 0 };
  let visible = true;
  let enEscena = false;
  let prensadoEscena: number | null = null;
  const recolocar = (): void => {
    const p = poses();
    const viaje = !esMovil() && !!vinilo && !!platoEscena;
    const plato = viaje ? poseDe(platoEscena) : null;
    let pose: Pose;
    prensadoEscena = null;
    enEscena = false;
    if (avance.c > 0) {
      pose = mezclar(p.abajo, p.final, suave(avance.c));
      prensadoEscena = 1;
    } else if (plato && avance.v > 0) {
      enEscena = true;
      if (avance.e > 0) {
        pose = { ...plato, o: avance.e >= 1 ? 0 : 1 - suave(avance.e) };
        prensadoEscena = compartido.prensado;
      } else if (avance.d > 0 || avance.v >= 1) {
        pose = plato;
        prensadoEscena = compartido.prensado;
      } else {
        // Llega al plato en blanco: los surcos se recogen mientras vuela.
        pose = mezclar(p.lado, plato, suave(avance.v));
        prensadoEscena = 1 - suave(avance.v);
      }
    } else if (!viaje && avance.b > 0) {
      pose = mezclar(p.lado, p.fuera, suave(avance.b));
      if (avance.b >= 1) pose = { ...pose, o: 0 };
    } else {
      pose = mezclar(p.hero, p.lado, suave(avance.a));
      if (avance.a > 0) prensadoEscena = 1;
    }
    colocar(pose);
    // Sobre la escena el disco pasa por delante del contenido (por debajo del menú).
    if (marco) marco.style.zIndex = enEscena ? "2" : "";
    // El plato SVG de la escena deja el hueco al vinilo y reaparece cuando este se apaga.
    if (platoEscena instanceof SVGElement)
      platoEscena.style.opacity = enEscena ? String(1 - pose.o) : "";
    visible = pose.o > 0.01;
    vinilo?.activo(visible);
  };
  const seguir = (clave: keyof typeof avance) => (st: ScrollTrigger) => {
    avance[clave] = st.progress;
    recolocar();
  };
  ScrollTrigger.create({
    trigger: hero,
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: seguir("a"),
  });
  ScrollTrigger.create({
    trigger: ".manifiesto",
    start: "bottom 85%",
    end: "bottom 15%",
    scrub: true,
    onUpdate: seguir("b"),
  });
  ScrollTrigger.create({
    trigger: ".como",
    start: "top bottom",
    end: "top top",
    scrub: true,
    onUpdate: seguir("v"),
  });
  ScrollTrigger.create({
    trigger: ".como",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: seguir("d"),
  });
  ScrollTrigger.create({
    trigger: ".como",
    start: "bottom bottom",
    end: "bottom 45%",
    scrub: true,
    onUpdate: seguir("e"),
  });
  ScrollTrigger.create({
    trigger: ".final",
    start: "top bottom",
    end: "center center",
    scrub: true,
    onUpdate: seguir("c"),
  });
  // Tras llegar, el disco sigue a la sección del final hasta que sale por arriba.
  ScrollTrigger.create({
    trigger: ".final",
    start: "center center",
    end: "bottom top",
    onUpdate: recolocar,
  });
  ScrollTrigger.addEventListener("refreshInit", () => {
    base = poses().hero.d;
  });
  ScrollTrigger.addEventListener("refresh", recolocar);

  // Luz e inclinación siguiendo al cursor (en cualquier punto de la página).
  const inclinaX = gsap.quickTo(giro, "rotationX", { duration: 1.2, ease: "power3" });
  const inclinaY = gsap.quickTo(giro, "rotationY", { duration: 1.2, ease: "power3" });
  addEventListener(
    "pointermove",
    (e) => {
      if (!visible) return;
      const caja = capa.getBoundingClientRect();
      const dx = e.clientX - (caja.left + caja.width / 2);
      const dy = e.clientY - (caja.top + caja.height / 2);
      vinilo?.luz(Math.atan2(dy, dx) + Math.PI / 2);
      // En el plato de la escena no se inclina: está «montado» en la app.
      const k = enEscena ? 0 : 1;
      inclinaY((dx / innerWidth) * 14 * k);
      inclinaX((-dy / innerHeight) * 10 * k);
    },
    { passive: true },
  );

  let introEnCurso = true;
  gsap.ticker.add((_, dtMs) => {
    if (!visible || !vinilo) return;
    const dt = Math.min(dtMs, 50) / 1000;
    // Fuera del tramo fijado, el plato de la escena se mueve con la página.
    if (enEscena) recolocar();
    if (!introEnCurso && prensadoEscena !== null) vinilo.prensado(prensadoEscena);
    // El empuje del scroll se escala con el fotograma: igual a 60 Hz que a 144 Hz.
    vinilo.empujar(velocidad() * 0.72 * dt);
    vinilo.pintar(dt);
  });

  // El titular se hunde al bajar.
  gsap.to(titulo, {
    yPercent: 35,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
  });

  const rpm = hero.querySelector<HTMLElement>(".hero__rpm");
  let rpmEscrito = "";
  gsap.ticker.add(() => {
    if (!rpm || !vinilo || avance.a >= 1) return;
    const v = Math.abs(vinilo.rpm()).toFixed(1);
    const texto = document.documentElement.lang === "es" ? v.replace(".", ",") : v;
    if (texto !== rpmEscrito) rpm.textContent = rpmEscrito = texto;
  });

  return {
    entrar() {
      const prensado = { v: 0 };
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .to(giro, { opacity: 1, scale: 1, rotate: 0, duration: 1.5 }, 0)
        .to(
          prensado,
          {
            v: 1,
            duration: 1.6,
            ease: "power2.inOut",
            onUpdate: () => vinilo?.prensado(prensado.v),
            onComplete: () => void (introEnCurso = false),
          },
          0.1,
        )
        .to(letras, { yPercent: 0, duration: 1.1, stagger: 0.04 }, 0.05)
        .to(palabras, { yPercent: 0, duration: 1, stagger: 0.03 }, 0.2)
        .to(resto, { opacity: 1, y: 0, duration: 1, stagger: 0.05 }, 0.35);
    },
    repartir() {
      palabras = partir(lema);
    },
  };
}
