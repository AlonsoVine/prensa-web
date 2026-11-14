// Hero: el vinilo WebGL, el titular gigante y la entrada tras la precarga.
import gsap from "gsap";
import { partir } from "../efectos/partir";
import { montarVinilo, type Vinilo } from "../gl/vinilo";

export interface Hero {
  entrar(): void;
  repartir(): void;
}

export async function montarHero(quieto: boolean, velocidad: () => number): Promise<Hero> {
  const hero = document.querySelector<HTMLElement>(".hero");
  const lienzo = hero?.querySelector<HTMLCanvasElement>(".vinilo");
  const discoCaja = hero?.querySelector<HTMLElement>(".hero__disco");
  const titulo = hero?.querySelector<HTMLElement>(".hero__titulo > span");
  const lema = hero?.querySelector<HTMLElement>(".hero__lema");
  if (!hero || !lienzo || !discoCaja || !titulo || !lema) return { entrar() {}, repartir() {} };

  const letras = partir(titulo, "letras");
  let palabras = partir(lema);
  const resto = hero.querySelectorAll(
    ".hero__rotulo, .hero__sub, .hero__acciones, .hero__meta, .hero__datos, .hero__aguja",
  );

  let vinilo: Vinilo | null = null;
  try {
    vinilo = await montarVinilo(lienzo, quieto);
  } catch {
    vinilo = null;
  }

  if (quieto) {
    if (vinilo) {
      const v = vinilo;
      new ResizeObserver(() => v.pintar(0)).observe(lienzo);
    }
    return { entrar() {}, repartir: () => void partir(lema) };
  }

  gsap.set(letras, { yPercent: 105 });
  gsap.set(palabras, { yPercent: 115 });
  gsap.set(resto, { opacity: 0, y: 24 });
  gsap.set(discoCaja, { opacity: 0, scale: 0.86, rotate: -25 });

  // Luz y leve inclinación siguiendo al cursor.
  gsap.set(hero, { perspective: 1400 });
  const inclinaX = gsap.quickTo(discoCaja, "rotationX", { duration: 1.2, ease: "power3" });
  const inclinaY = gsap.quickTo(discoCaja, "rotationY", { duration: 1.2, ease: "power3" });
  hero.addEventListener("pointermove", (e) => {
    const caja = discoCaja.getBoundingClientRect();
    const dx = e.clientX - (caja.left + caja.width / 2);
    const dy = e.clientY - (caja.top + caja.height / 2);
    vinilo?.luz(Math.atan2(dy, dx) + Math.PI / 2);
    inclinaY((dx / innerWidth) * 14);
    inclinaX((-dy / innerHeight) * 10);
  });

  // Fotogramas solo mientras el hero está a la vista.
  let visible = true;
  new IntersectionObserver(([entrada]) => {
    visible = !!entrada?.isIntersecting;
    vinilo?.activo(visible);
  }).observe(hero);
  gsap.ticker.add((_, dtMs) => {
    if (!visible || !vinilo) return;
    vinilo.empujar(velocidad() * 0.012);
    vinilo.pintar(Math.min(dtMs, 50) / 1000);
  });

  // Al bajar: el disco se aleja y el titular se hunde.
  gsap.to(discoCaja, {
    yPercent: 22,
    scale: 0.82,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(titulo, {
    yPercent: 35,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
  });

  const rpm = hero.querySelector<HTMLElement>(".hero__rpm");
  gsap.ticker.add(() => {
    if (!visible || !rpm) return;
    const v = 33.3 + Math.min(Math.abs(velocidad()) * 0.6, 44.7);
    rpm.textContent = v.toFixed(1).replace(".", ",");
  });

  return {
    entrar() {
      const prensado = { v: 0 };
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .to(discoCaja, { opacity: 1, scale: 1, rotate: 0, duration: 2.2 }, 0)
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
