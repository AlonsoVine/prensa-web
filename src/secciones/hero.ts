// Hero y disco global.
//
// Un solo vinilo WebGL acompaña la página: nace grande en el hero (se prensa de
// fuera hacia dentro al entrar), se aparta a la derecha del manifiesto, se retira
// antes de «Cómo funciona» y vuelve al final, detrás de «Tu música, prensada».
// Su posición es una función pura del scroll: se puede ir y volver sin acumular.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { partir } from "../efectos/partir";
import { montarVinilo, type Vinilo } from "../gl/vinilo";

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

function poses(): { hero: Pose; lado: Pose; fuera: Pose; abajo: Pose; final: Pose } {
  const w = innerWidth;
  const h = innerHeight;
  const movil = w <= 860;
  if (movil) {
    const d = w * 1.1;
    const hero = { x: w * 0.85, y: h * 0.84, d, o: 1 };
    return {
      hero,
      lado: { ...hero, y: h * 0.5, d: d * 0.8, o: 0.0 },
      fuera: { ...hero, y: -d, o: 0 },
      abajo: { x: w * 0.5, y: h * 1.3, d: w * 0.7, o: 0 },
      final: { x: w * 0.5, y: h * 0.5, d: w * 1.05, o: 0.9 },
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
    abajo: { x: w * 0.5, y: h * 1.25, d: Math.min(h * 0.95, w * 0.7) * 0.8, o: 1 },
    final: { x: w * 0.5, y: h * 0.5, d: Math.min(h * 0.95, w * 0.7), o: 1 },
  };
}

export async function montarHero(quieto: boolean, velocidad: () => number): Promise<Hero> {
  const hero = document.querySelector<HTMLElement>(".hero");
  const capa = document.querySelector<HTMLElement>(".disco-fijo");
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
  const avance = { a: 0, b: 0, c: 0 };
  let visible = true;
  const recolocar = (): void => {
    const p = poses();
    let pose: Pose;
    if (avance.c > 0) pose = mezclar(p.abajo, p.final, suave(avance.c));
    else if (avance.b > 0) pose = mezclar(p.lado, p.fuera, suave(avance.b));
    else pose = mezclar(p.hero, p.lado, suave(avance.a));
    if (avance.b >= 1 && avance.c <= 0) pose = { ...pose, o: 0 };
    colocar(pose);
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
    trigger: ".final",
    start: "top bottom",
    end: "center center",
    scrub: true,
    onUpdate: seguir("c"),
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
      inclinaY((dx / innerWidth) * 14);
      inclinaX((-dy / innerHeight) * 10);
    },
    { passive: true },
  );

  gsap.ticker.add((_, dtMs) => {
    if (!visible || !vinilo) return;
    vinilo.empujar(velocidad() * 0.012);
    vinilo.pintar(Math.min(dtMs, 50) / 1000);
  });

  // El titular se hunde al bajar.
  gsap.to(titulo, {
    yPercent: 35,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
  });

  const rpm = hero.querySelector<HTMLElement>(".hero__rpm");
  gsap.ticker.add(() => {
    if (!rpm || avance.a >= 1) return;
    const v = 33.3 + Math.min(Math.abs(velocidad()) * 0.6, 44.7);
    rpm.textContent = v.toFixed(1).replace(".", ",");
  });

  return {
    entrar() {
      const prensado = { v: 0 };
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .to(giro, { opacity: 1, scale: 1, rotate: 0, duration: 2.2 }, 0)
        .to(
          prensado,
          {
            v: 1,
            duration: 2.4,
            ease: "power2.inOut",
            onUpdate: () => vinilo?.prensado(prensado.v),
          },
          0.1,
        )
        .to(letras, { yPercent: 0, duration: 1.4, stagger: 0.06 }, 0.15)
        .to(palabras, { yPercent: 0, duration: 1.2, stagger: 0.04 }, 0.35)
        .to(resto, { opacity: 1, y: 0, duration: 1.2, stagger: 0.07 }, 0.6);
    },
    repartir() {
      palabras = partir(lema);
    },
  };
}
