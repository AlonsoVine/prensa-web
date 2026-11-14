// Cara B: la galleta del autor gira con el scroll y seis cuerdas de guitarra
// vibran al pasar el cursor (o el dedo). Con el sonido activado suenan de verdad:
// síntesis Karplus-Strong, sin muestras ni ficheros de audio.
import gsap from "gsap";
import { t } from "../i18n";

const SVG = "http://www.w3.org/2000/svg";
// De la sexta a la primera: Mi grave arriba, como al mirar la guitarra en brazos.
const CUERDAS = [
  { nota: "E", hz: 82.41, grosor: 3.2 },
  { nota: "A", hz: 110.0, grosor: 2.6 },
  { nota: "D", hz: 146.83, grosor: 2.1 },
  { nota: "G", hz: 196.0, grosor: 1.7 },
  { nota: "B", hz: 246.94, grosor: 1.3 },
  { nota: "e", hz: 329.63, grosor: 1.0 },
];
const MARGEN = 44;

interface Estado {
  y: number;
  x: number;
  amplitud: number;
  t: number;
  frecuencia: number;
  camino: SVGPathElement;
}

export function montarAutor(quieto: boolean): void {
  const galleta = document.querySelector<SVGSVGElement>(".autor__galleta svg");
  if (galleta && !quieto) {
    gsap.to(galleta, {
      rotate: 300,
      ease: "none",
      scrollTrigger: { trigger: ".autor", start: "top bottom", end: "bottom top", scrub: true },
    });
  }
  montarCuerdas(quieto);
}

function sintetizar(ctx: AudioContext, hz: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const n = Math.round(sr / hz);
  const buffer = ctx.createBuffer(1, Math.round(sr * 2.6), sr);
  const datos = buffer.getChannelData(0);
  const anillo = new Float32Array(n);
  for (let i = 0; i < n; i++) anillo[i] = Math.random() * 2 - 1;
  let idx = 0;
  const amortiguacion = 0.996 - hz / 60000;
  for (let i = 0; i < datos.length; i++) {
    const actual = anillo[idx] ?? 0;
    const siguiente = anillo[(idx + 1) % n] ?? 0;
    anillo[idx] = (actual + siguiente) * 0.5 * amortiguacion;
    datos[i] = actual;
    idx = (idx + 1) % n;
  }
  return buffer;
}

function montarCuerdas(quieto: boolean): void {
  const svg = document.querySelector<SVGSVGElement>(".mastil__cuerdas");
  const boton = document.querySelector<HTMLButtonElement>(".mastil__sonido");
  const ayuda = document.querySelector<HTMLElement>(".mastil__ayuda");
  if (!svg || !boton) return;

  const tactil = matchMedia("(hover: none)").matches;
  const rotularAyuda = (): void => {
    if (ayuda) ayuda.textContent = t(tactil ? "autor.cuerdas.tactil" : "autor.cuerdas");
  };
  rotularAyuda();

  let ancho = 1000;
  let alto = 200;
  const estados: Estado[] = CUERDAS.map((c) => {
    const camino = document.createElementNS(SVG, "path");
    camino.setAttribute("stroke-width", String(c.grosor));
    svg.append(camino);
    return { y: 0, x: 0, amplitud: 0, t: 0, frecuencia: 7 + c.hz / 40, camino };
  });
  const notas = CUERDAS.map((c) => {
    const texto = document.createElementNS(SVG, "text");
    texto.textContent = c.nota;
    texto.setAttribute("class", "mastil__nota");
    svg.append(texto);
    return texto;
  });

  const dibujar = (e: Estado, desplazamiento: number): void => {
    const x = gsap.utils.clamp(MARGEN + 20, ancho - 20, e.x);
    e.camino.setAttribute(
      "d",
      `M${MARGEN},${e.y} Q${x},${e.y + desplazamiento * 2} ${ancho},${e.y}`,
    );
    e.camino.classList.toggle("vibrando", Math.abs(desplazamiento) > 0.6);
  };

  const medir = (): void => {
    const caja = svg.getBoundingClientRect();
    ancho = Math.max(200, caja.width);
    alto = Math.max(80, caja.height);
    svg.setAttribute("viewBox", `0 0 ${ancho} ${alto}`);
    estados.forEach((e, i) => {
      e.y = (alto * (i + 0.75)) / (CUERDAS.length + 0.5);
      notas[i]?.setAttribute("x", "8");
      notas[i]?.setAttribute("y", String(e.y + 4));
      dibujar(e, 0);
    });
  };
  medir();
  new ResizeObserver(medir).observe(svg);

  // ── Sonido ──
  let audio: AudioContext | null = null;
  let buffers: AudioBuffer[] = [];
  let sonido = false;
  const tocar = (i: number, fuerza: number): void => {
    const buffer = buffers[i];
    if (!sonido || !audio || !buffer) return;
    const fuente = audio.createBufferSource();
    fuente.buffer = buffer;
    const ganancia = audio.createGain();
    ganancia.gain.value = 0.12 + 0.25 * fuerza;
    const filtro = audio.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 2200 + 2600 * fuerza;
    fuente.connect(filtro).connect(ganancia).connect(audio.destination);
    fuente.start();
  };
  const rotularBoton = (): void => {
    boton.setAttribute("aria-pressed", String(sonido));
    const texto = boton.querySelector("[data-i18n]");
    if (texto) {
      const clave = sonido ? "autor.sonido.on" : "autor.sonido.off";
      texto.setAttribute("data-i18n", clave);
      texto.textContent = t(clave);
    }
  };
  boton.addEventListener("click", async () => {
    sonido = !sonido;
    if (sonido && !audio) {
      const ctx = new AudioContext();
      audio = ctx;
      buffers = CUERDAS.map((c) => sintetizar(ctx, c.hz));
    }
    if (audio?.state === "suspended") await audio.resume();
    rotularBoton();
    if (sonido) tocar(0, 0.5);
  });
  document.addEventListener("prensa:idioma", () => {
    rotularBoton();
    rotularAyuda();
  });

  // ── Vibración ──
  let animando = false;
  const bucle = (_: number, dtMs: number): void => {
    const dt = Math.min(dtMs, 50) / 1000;
    let alguna = false;
    for (const e of estados) {
      if (e.amplitud === 0) continue;
      e.t += dt;
      const envolvente = Math.exp(-e.t / 0.9);
      if (Math.abs(e.amplitud * envolvente) < 0.15) {
        e.amplitud = 0;
        dibujar(e, 0);
        continue;
      }
      alguna = true;
      dibujar(e, e.amplitud * envolvente * Math.cos(2 * Math.PI * e.frecuencia * e.t));
    }
    if (!alguna) {
      gsap.ticker.remove(bucle);
      animando = false;
    }
  };
  const pulsar = (i: number, x: number, fuerza: number): void => {
    const e = estados[i];
    if (!e) return;
    tocar(i, gsap.utils.clamp(0, 1, fuerza));
    if (quieto) return;
    e.x = x;
    e.t = 0;
    e.amplitud = (6 + 10 * gsap.utils.clamp(0, 1, fuerza)) * (Math.random() > 0.5 ? 1 : -1);
    if (!animando) {
      animando = true;
      gsap.ticker.add(bucle);
    }
  };

  const local = (ev: PointerEvent): { x: number; y: number } => {
    const caja = svg.getBoundingClientRect();
    return {
      x: ((ev.clientX - caja.left) / caja.width) * ancho,
      y: ((ev.clientY - caja.top) / caja.height) * alto,
    };
  };
  let anterior: { x: number; y: number; t: number } | null = null;
  svg.addEventListener("pointermove", (ev) => {
    const p = local(ev);
    const ahora = performance.now();
    const previo = anterior;
    if (previo) {
      const velocidad = Math.abs(p.y - previo.y) / Math.max(1, ahora - previo.t);
      estados.forEach((e, i) => {
        if ((previo.y - e.y) * (p.y - e.y) < 0) pulsar(i, p.x, velocidad * 0.9);
      });
    }
    anterior = { ...p, t: ahora };
  });
  svg.addEventListener("pointerleave", () => (anterior = null));
  svg.addEventListener("pointerdown", (ev) => {
    const p = local(ev);
    let cerca = 0;
    estados.forEach((e, i) => {
      if (Math.abs(e.y - p.y) < Math.abs((estados[cerca]?.y ?? 0) - p.y)) cerca = i;
    });
    pulsar(cerca, p.x, 0.7);
  });
}
